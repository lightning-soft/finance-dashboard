import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DataGridModule} from 'data-grid';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {OrdersComponent} from './orders.component';
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
    OrdersComponent
  ],
  declarations: [
    OrdersComponent,
  ],

})
export class OrdersModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Orders]: OrdersComponent
    };
  }
}
