import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountSelectModule } from 'account-select';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzSelectModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrdersComponent } from './orders.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    NzSelectModule,
    FormsModule,
    AccountSelectModule,
    WindowHeaderModule,
  ],
  exports: [
    OrdersComponent,
    OrdersToolbarComponent
  ],
  declarations: [
    OrdersComponent,
    OrdersToolbarComponent
  ],

})
export class OrdersModule implements LazyModule {
  get components(): ComponentStore {
    return {
      orders: OrdersComponent
    };
  }
}
