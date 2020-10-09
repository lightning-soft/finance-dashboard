import { NgModule } from '@angular/core';
import { NzNotificationServiceModule } from 'ng-zorro-antd/notification';
import { NotifierService } from './services/notifier.service';
import { NgZorroNotifierService } from './services/zorro-notifier.service';

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
