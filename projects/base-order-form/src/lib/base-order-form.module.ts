import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityInputComponent } from './quantity-input/quantity-input.component';
import {
  NzButtonModule,
  NzCheckboxModule,
  NzInputModule,
  NzInputNumberModule,
  NzPopoverModule,
  NzSelectModule
} from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlUnitsComponent } from './sl-units/sl-units.component';
import { TpUnitsComponent } from './tp-units/tp-units.component';



@NgModule({
  declarations: [QuantityInputComponent, SlUnitsComponent, TpUnitsComponent],
  imports: [
    CommonModule,
    NzInputNumberModule,
    FormsModule,
    NzButtonModule,
    NzPopoverModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzSelectModule,
    NzInputModule,
  ],
  exports: [QuantityInputComponent, SlUnitsComponent, TpUnitsComponent]
})
export class BaseOrderFormModule { }
