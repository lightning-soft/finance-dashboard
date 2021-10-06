import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ItemComponent } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { ISession, ISessionWorkingTime, ITimezone, SessionsRepository, TimezonesRepository } from 'trading';

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

  utcStartTime = (9 * 3600 + 30 * 60) * 1000;
  utcEndTime = 16 * 3600 * 1000;

  constructor(
    protected _injector: Injector,
    protected _repository: SessionsRepository,
    private _modal: NzModalService,
    public timezonesRepository: TimezonesRepository,
  ) {
    super();

    this.setTabIcon('icon-clock');
    this.setTabTitle('Session Manager');
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
        startTime: this.utcStartTime,
        endDay: 2,
        endTime: this.utcEndTime,
      });
    } else {
      const lastDay = this.item.workingTimes[this.item.workingTimes.length - 1];
      let startDay, endDay;
      if (lastDay.endDay === lastDay.startDay) {
        startDay = lastDay.endDay + 1 % this.days.length;
        endDay = startDay;
      } else {
        startDay = lastDay.endDay % this.days.length;
        endDay = (lastDay.endDay + 1) % this.days.length;
      }
      this.item.workingTimes.push({
        startDay,
        startTime: this.utcStartTime,
        endDay,
        endTime: this.utcEndTime,
      });
    }
  }

  createMissingWorkingTime() {
    const shouldAddDays = [true, true, true, true, true, true, true];
    this.item.workingTimes.forEach((item) => {
      if (item.endDay >= item.startDay) {
        for (let i = item.startDay; i <= item.endDay; i++) {
          shouldAddDays[i] = false;
        }
      } else {
        shouldAddDays.map((value, index) => {
          if (item.startDay >= index || item.endDay <= index)
            return false;
          return value;
        });
      }
    });
    shouldAddDays.forEach((value, index) => {
      if (value && index !== 0 && index !== shouldAddDays.length - 1)
        this.item.workingTimes.push({
          startDay: index,
          startTime: this.utcStartTime,
          endDay: index,
          endTime: this.utcEndTime,
        });
    });
  }

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
        this.item.name = this.sessionName;

        this.save();
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
