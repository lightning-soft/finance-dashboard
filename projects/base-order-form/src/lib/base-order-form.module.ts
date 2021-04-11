import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityInputComponent } from './quantity-input/quantity-input.component';
import {
    NzButtonModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzPopoverModule,
    NzSelectModule, NzSwitchModule
} from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlUnitsComponent } from './sl-units/sl-units.component';
import { TpUnitsComponent } from './tp-units/tp-units.component';
import { SideOrderFormComponent } from './side-order-form/side-order-form.component';
import { ScrollingModule } from "@angular/cdk/scrolling";
import { TypeButtonsComponent } from "./type-buttons/type-buttons.component";



@NgModule({
  declarations: [QuantityInputComponent, SlUnitsComponent, TpUnitsComponent, SideOrderFormComponent, TypeButtonsComponent],
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
    NzSwitchModule,
    ScrollingModule,
  ],
  exports: [QuantityInputComponent, SlUnitsComponent, SideOrderFormComponent, TpUnitsComponent]
})
export class BaseOrderFormModule { }
