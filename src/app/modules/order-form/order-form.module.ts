import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Components, ComponentStore, LazyModule } from '../lazy-modules';
import { OrderFormComponent } from './order-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    OrderFormComponent
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
      [Components.OrderForm]: OrderFormComponent
    };
  }
}
