import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzSelectModule } from 'ng-zorro-antd';
import { from } from 'rxjs';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrdersComponent } from './orders.component';
import { AccountSelectModule } from 'account-select';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    NzSelectModule,
    FormsModule,
    AccountSelectModule,
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
