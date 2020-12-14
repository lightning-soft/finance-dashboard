import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule, NzFormModule, NzRadioModule, NzSelectModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [DynamicFormComponent, DynamicFieldComponent],
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    NzFormModule,
    FormsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule
  ],
  exports: [DynamicFormComponent, DynamicFieldComponent]
})
export class DynamicFormModule {
}
