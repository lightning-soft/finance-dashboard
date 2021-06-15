import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzButtonModule, NzCollapseModule, NzFormModule, NzInputModule, NzSelectModule, NzTabsModule, NzTransferModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { NotificationListComponent } from './notification-list.component';

@NgModule({
  declarations: [NotificationListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCollapseModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTabsModule,
    NzTransferModule,
    ScrollingModule,
    WindowHeaderModule,
  ],
  exports: [NotificationListComponent]
})
export class NotificationListModule implements LazyModule {
  get components(): ComponentStore {
    return {
      'notification-list': NotificationListComponent
    };
  }
}
