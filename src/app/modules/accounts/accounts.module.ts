import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { AccountConnectComponent } from './account-connect/account-connect.component';
import { AccountItemComponent } from './account-item/account-item.component';
import { AccountsComponent } from './accounts.component';
import { AccountsService } from './accounts.service';

@NgModule({
  imports: [
    NzSelectModule,
    CommonModule,
    NzInputModule,
    ReactiveFormsModule,
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
    AccountsService
  ]
})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
     // [Components.Accounts]: AccountsComponent
    };
  }
}
