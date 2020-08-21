import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderFormComponent} from './order-form.component';
import {Components, ComponentStore, LazyModule} from '../lazy-modules';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
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
