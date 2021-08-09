import { AfterViewInit, Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { ISession, SessionsRepository } from 'trading';


@Component({
  selector: 'sessions-select',
  templateUrl: './sessions-select.component.html',
  styleUrls: ['./sessions-select.component.scss']
})
export class SessionsSelectComponent extends FieldType implements AfterViewInit {
  label = 'Session Template';

  constructor(public repository: SessionsRepository) {
    super();
  }
  ngAfterViewInit() {
    if (this.field.templateOptions.label)
      this.label = this.field.templateOptions.label;
  }

  handleSessionChange(session: ISession) {
    this.formControl.setValue(session);
  }
}
