import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ItemComponent } from 'base-components';
import { IDataSelectItemAction } from 'data-select';
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
    workingTimesDto: [],
  };

  session: ISession = jQuery.extend(true, {}, this.blankSession);
  sessionName: string;

  sessionActions: IDataSelectItemAction[] = [
    {
      icon: 'icon-edit',
      callback: (session: ISession) => {
        this.session = session;
      },
    },
    {
      icon: 'icon-duplicate',
      callback: (session: ISession) => {
        this.session = {
          ...session,
          id: 0,
        };
      },
    },
    {
      icon: 'icon-delete',
      callback: (session: ISession) => {
        this.deleteItem(session);
      },
    },
  ];

  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  utcBeginTime = (9 * 3600 + 30 * 60) * 1000;
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
    this.session = session;
    this.sessionName = session.name;
  }

  handleTimezoneChange(timezone: ITimezone) {
    this.session.timezoneId = timezone.id;
  }

  createWorkingTime(beginDay = 1, endDay = 1) {
    this.session.workingTimesDto.push({
      beginDay,
      beginTime: this.utcBeginTime,
      endDay,
      endTime: this.utcEndTime,
    });
  }

  deleteWorkingTime(item: ISessionWorkingTime) {
    this.session.workingTimesDto = this.session.workingTimesDto.filter(i => i !== item);
  }

  save(callback: (item: ISession) => void = () => this._showSuccess()) {
    const { session, repository } = this;

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
    this.sessionName = this.session.name;

    this._modal.create({
      nzTitle: 'Save As',
      nzContent: this.nameForm,
      nzCancelText: null,
      nzOkText: 'Save',
      nzOnOk: () => {
        this.session.name = this.sessionName;

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
    this.session = jQuery.extend(true, [], items[0]);
  }

}
