import {NgModule} from '@angular/core';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {AccountsComponent} from './accounts.component';
import {NzSelectModule} from 'ng-zorro-antd';
import {AccountItemComponent} from './account-item/account-item.component';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    NzSelectModule,
    CommonModule,
  ],
  exports: [
    AccountsComponent
  ],
  declarations: [
    AccountsComponent,
    AccountItemComponent,
  ],

})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Accounts]: AccountsComponent
    };
  }
}
