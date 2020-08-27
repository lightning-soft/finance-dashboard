import {NgModule} from '@angular/core';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {AccountsComponent} from './accounts.component';
import {NzInputModule, NzSelectModule} from 'ng-zorro-antd';
import {AccountItemComponent} from './account-item/account-item.component';
import {CommonModule} from '@angular/common';
import { AccountConnectComponent } from './account-connect/account-connect.component';
import {ReactiveFormsModule} from '@angular/forms';

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
    AccountConnectComponent,
  ],

})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
     // [Components.Accounts]: AccountsComponent
    };
  }
}
