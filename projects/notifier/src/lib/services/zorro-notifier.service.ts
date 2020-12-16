import { NotifierService } from './notifier.service';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class NgZorroNotifierService extends NotifierService {
  constructor(private notifyService: NzNotificationService) {
    super();
  }

  showError(message: any, defaultMessage?: string) {
    let _message = defaultMessage ?? 'Something wrong';
    let _title = 'Error';

    if (message instanceof HttpErrorResponse && message.error)
      message = message.error;

    if (isString(message))
      _message = message;
    else if (isString(message?.message))
      _message = message.message;
    else if (isString(message?.error?.message))
      _message = message.error.message;
    else if (Array.isArray(message?.message))
      _message = message.message
        .map(i => i.constraints)
        .reduce((acc, i) => [...acc, Object.keys(i).map(key => i[key])], [])
        .join(',');


    if (isString(message?.error))
      _title = message.error;

    this.notifyService.error(_title, _message);
  }

  showSuccess(message: string) {
    this.notifyService.success('Success', message);
  }
}

function isString(value) {
  return typeof value === 'string';
}
