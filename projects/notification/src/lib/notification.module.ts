import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NotificationService } from './notification.service';


@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    NotificationService,
  ]
})
export class NotificationModule {
  static forRoot(): ModuleWithProviders<NotificationModule> {
    return {
      ngModule: NotificationModule,
      providers: [
        NotificationService,
      ]
    };
  }
}
