import {NotifierService} from './notifier.service';
import {Injectable} from '@angular/core';
import {NzNotificationService} from 'ng-zorro-antd';

@Injectable()
export class NgZorroNotifierService extends NotifierService {
  constructor(private notifyService: NzNotificationService) {
    super();
  }

  showError(message: string, defaultMessage?: string) {
    this.notifyService.error(message, defaultMessage);
  }

  showSuccess(message: string) {
    this.notifyService.success(message, null);

  }

}
