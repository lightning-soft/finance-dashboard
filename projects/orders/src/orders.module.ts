import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountSelectModule } from 'account-select';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzDropDownModule, NzRadioModule, NzSelectModule, NzTabsModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrdersComponent } from './orders.component';
import { LoaderModule } from 'ui';
import { ordersSettings, OrdersSettingsComponent } from './components/orders-settings/orders-settings.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DynamicFormModule } from 'dynamic-form';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    NzSelectModule,
    FormsModule,
    AccountSelectModule,
    WindowHeaderModule,
    NzTabsModule,
    NzDropDownModule,
    LoaderModule,
    ScrollingModule,
    DynamicFormModule,
    NzRadioModule,
  ],
  exports: [
    OrdersComponent,
    OrdersToolbarComponent
  ],
  declarations: [
    OrdersComponent,
    OrdersToolbarComponent,
    OrdersSettingsComponent,
  ],

})
export class OrdersModule implements LazyModule {
  get components(): ComponentStore {
    return {
      orders: OrdersComponent,
      [ordersSettings]: OrdersSettingsComponent,
    };
  }
}
