import { NotifierService } from './notifier.service';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';

@Injectable()
export class NgZorroNotifierService extends NotifierService {
  constructor(private notifyService: NzNotificationService) {
    super();
  }

  showError(message: any, defaultMessage?: string) {
    const { _title, _message} = this._prepareErrorMessage(message, defaultMessage);
    this.notifyService.error(_title, _message);
  }

  showSuccess(message: string) {
    this.notifyService.success('Success', message);
  }
}


