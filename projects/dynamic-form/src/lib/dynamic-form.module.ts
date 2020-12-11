import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule, NzFormModule, NzSelectModule } from "ng-zorro-antd";


@NgModule({
  declarations: [DynamicFormComponent, DynamicFieldComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    FormsModule,
    NzSelectModule,
    NzCheckboxModule
  ],
  exports: [DynamicFormComponent, DynamicFieldComponent]
})
export class DynamicFormModule {
}
