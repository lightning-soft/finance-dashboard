import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { ISession, SessionsRepository } from 'trading';


@Component({
  selector: 'sessions-select',
  templateUrl: './sessions-select.component.html',
  styleUrls: ['./sessions-select.component.scss']
})
export class SessionsSelectComponent extends FieldType {
  constructor(public repository: SessionsRepository) {
    super();
  }

  handleSessionChange(session: ISession) {
    this.formControl.setValue(session.workingTimes);
  }
}
