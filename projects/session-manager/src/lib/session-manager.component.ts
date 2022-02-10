import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ItemComponent } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { ISession, ISessionWorkingTime, ITimezone, SessionsRepository, TimezonesRepository } from 'trading';
import { RenameModalComponent } from 'ui';

export interface SessionManagerComponent extends ILayoutNode, ItemComponent<ISession> {
}

@Component({
  selector: 'lib-session-manager',
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.scss'],
})
@LayoutNode()
export class SessionManagerComponent extends ItemComponent<ISession> {

  @ViewChild('nameForm') nameForm: TemplateRef<any>;
  @ViewChild('success') success: TemplateRef<any>;

  blankSession: ISession = {
    id: 0,
    name: 'New Session',
    exchange: 'CME',
    timezoneId: null,
    workingTimes: [],
  };

  item: ISession = jQuery.extend(true, {}, this.blankSession);
  sessionName: string;

  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  defaultUtcStartTime = (9 * 3600 + 30 * 60) * 1000;
  defaultUtcEndTime = 16 * 3600 * 1000;

  constructor(
    protected _injector: Injector,
    protected _repository: SessionsRepository,
    private _modal: NzModalService,
    public timezonesRepository: TimezonesRepository,
    private _modalService: NzModalService,
  ) {
    super();

    this.setTabIcon('icon-clock');
    this.setTabTitle('Session Manager');
  }
  timezoneFinder = (value, item) => {
    return value === item.id || item.utcMap[value];
  }

  handleSessionChange(session: ISession) {
    this.item = session;
    this.sessionName = session.name;
  }

  handleTimezoneChange(timezone: ITimezone) {
    this.item.timezoneId = timezone.id;
  }

  createWorkingTime() {
    if (!this.item.workingTimes.length) {
      this.item.workingTimes.push({
        startDay: 1,
        startTime: this.defaultUtcStartTime,
        endDay: 2,
        endTime: this.defaultUtcEndTime,
      });
    } else {
      const lastDay = this.item.workingTimes[this.item.workingTimes.length - 1];
      let startDay, endDay;
      if (lastDay.endDay === lastDay.startDay) {
        startDay = (lastDay.endDay + 1) % this.days.length;
        endDay = startDay;
      } else {
        startDay = lastDay.endDay % this.days.length;
        endDay = (lastDay.endDay + 1) % this.days.length;
      }
      this.item.workingTimes.push({
        startDay,
        startTime: lastDay.startTime,
        endDay,
        endTime: lastDay.endTime,
      });
    }
  }

  createMissingWorkingTime() {
    const shouldAddDays = [true, true, true, true, true, true, true];
    this.item.workingTimes.forEach((item) => {
      if (item.endDay >= item.startDay) {
        shouldAddDays[item.startDay] = false;
        for (let i = item.startDay; i < item.endDay; i++) {
          shouldAddDays[i] = false;
        }
      } else {
        shouldAddDays.map((value, index) => {
          if (item.startDay >= index || item.endDay < index)
            return false;
          return value;
        });
      }
    });
    const length = shouldAddDays.length - 1;
    shouldAddDays.forEach((value, index) => {
      let workingTime;
      if (value && index !== 0 && index < length) {
        workingTime = this.item.workingTimes.find((item) => {
          if (item.startDay === item.endDay && item.endDay === index - 1)
            return true;

          return item.endDay === index;
        });
        const endDay = workingTime?.endDay !== workingTime?.startDay ? index + 1 : index;
        if (endDay === length)
          return;
        this.item.workingTimes.push({
          startDay: index,
          startTime: workingTime?.startTime ?? this.defaultUtcStartTime,
          endDay,
          endTime: workingTime?.endTime ?? this.defaultUtcEndTime,
        });
      }
    });
  }

  editSession = (item) => {
    this._modalService.create({
      nzTitle: 'Edit name',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        label: 'Session name',
        name: item.name,
      },
    }).afterClose.subscribe(name => {
      if (name)
        this._repository.updateItem({ ...item, name })
          .pipe(untilDestroyed(this))
          .subscribe();
    });
  };

  deleteWorkingTime(item: ISessionWorkingTime) {
    this.item.workingTimes = this.item.workingTimes.filter(i => i !== item);
  }

  save(callback: (item: ISession) => void = () => this._showSuccess()) {
    const { item: session, repository } = this;

    const hide = this.showLoading(true);

    const observable$ = !session.id
      ? repository.createItem(session)
      : repository.updateItem(session);

    observable$
      .pipe(
        untilDestroyed(this),
        finalize(() => hide()),
      )
      .subscribe(
        callback,
        (err) => console.error(err),
      );
  }

  saveAs() {
    this.sessionName = this.item.name;

    this._modal.create({
      nzTitle: 'Save As',
      nzContent: this.nameForm,
      nzCancelText: null,
      nzOkText: 'Save',
      nzOnOk: () => {
        const item = { ...this.item, name: this.sessionName };

        const hide = this.showLoading(true);
        this.repository.createItem(item)
          .pipe(
            untilDestroyed(this),
            finalize(() => hide()),
          )
          .subscribe(() => this._showSuccess());
      },
    });
  }

  cancel() {
    this.close();
  }

  ok() {
    this.save(() => this.close());
  }

  protected _showSuccess() {
    this._modal.create({
      nzTitle: 'Saving',
      nzContent: this.success,
      nzCancelText: null,
      nzOkText: null,
    });
  }

  protected _handleCreateItems(items: ISession[]) {
    this.item = jQuery.extend(true, [], items[0]);
  }

}
