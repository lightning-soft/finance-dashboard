import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { AccountConnectComponent } from './account-connect/account-connect.component';
import { AccountItemComponent } from './account-item/account-item.component';
import { AccountsComponent } from './accounts.component';
import { AccountsService } from './accounts.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTransButtonModule } from 'ng-zorro-antd/core/trans-button';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@NgModule({
  imports: [
    NzSelectModule,
    CommonModule,
    NzInputModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzButtonModule,
    NzTransButtonModule,
    NzUploadModule,
    NzAlertModule,
  ],
  exports: [
    AccountsComponent
  ],
  declarations: [
    AccountsComponent,
    AccountItemComponent,
    AccountConnectComponent
  ],
  providers: [
    AccountsService,
  ]
})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
     // [Components.Accounts]: AccountsComponent
    };
  }
}
