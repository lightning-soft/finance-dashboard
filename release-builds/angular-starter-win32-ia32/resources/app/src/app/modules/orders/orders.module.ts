import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzSelectModule } from 'ng-zorro-antd';
import { OrdersComponent } from './orders.component';

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
      orders: OrdersComponent
    };
  }
}
