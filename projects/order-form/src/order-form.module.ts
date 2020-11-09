import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { PositionsComponent } from './components/positions/positions.component';
import { NzInputNumberComponent, NzInputNumberModule, NzSelectModule } from 'ng-zorro-antd';
import { InstrumentSelectModule } from 'instrument-select';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputNumberModule,
    InstrumentSelectModule
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
