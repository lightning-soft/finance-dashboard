import {NgModule} from '@angular/core';
import {NgZorroNotifierService} from './zorro-notifier.service';
import {NotifierService} from './notifier.service';
import { NzNotificationServiceModule } from 'ng-zorro-antd/notification';

@NgModule({
  declarations: [],
  imports: [
    NzNotificationServiceModule
  ],
  providers: [
    {
      provide: NotifierService,
      useClass: NgZorroNotifierService
    }
  ],
  exports: []
})
export class NotifierModule {
}
