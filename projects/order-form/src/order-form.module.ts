import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountSelectModule } from 'account-select';
import { InstrumentSelectModule } from 'instrument-select';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzButtonModule, NzInputNumberModule, NzSelectModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { PositionsComponent } from './components/positions/positions.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputNumberModule,
    NzButtonModule,
    AccountSelectModule,
    InstrumentSelectModule,
    WindowHeaderModule,
  ],
  declarations: [
    PositionsComponent,
    OrderFormComponent,
  ],
  entryComponents: [
    OrderFormComponent
  ],
  exports: [
    OrderFormComponent
  ]
})
export class OrderFormModule implements LazyModule {
  get components(): ComponentStore {
    return {
      'order-form': OrderFormComponent
    };
  }
}
