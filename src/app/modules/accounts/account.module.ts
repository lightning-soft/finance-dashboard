import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DataGridModule} from 'data-grid';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {AccountComponent} from './account.component';
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
    AccountComponent
  ],
  declarations: [
    AccountComponent,
  ],

})
export class AccountModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Orders]: AccountComponent
    };
  }
}
