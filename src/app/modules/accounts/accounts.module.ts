import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DataGridModule} from 'data-grid';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {AccountsComponent} from './accounts.component';
import {NzSelectModule} from 'ng-zorro-antd';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    NzSelectModule,
    FormsModule,
  ],
  exports: [
    AccountsComponent
  ],
  declarations: [
    AccountsComponent,
  ],

})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Accounts]: AccountsComponent
    };
  }
}
