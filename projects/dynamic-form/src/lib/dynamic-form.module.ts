import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { FieldType } from './field';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { NumberInputComponent } from './number-input/number-input.component';


@NgModule({
  declarations: [ColorPickerComponent, NumberInputComponent],
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forRoot({
      types: [
        {
          name: FieldType.Color, component: ColorPickerComponent,
          wrappers: ['form-field']
        },
        {
          name: FieldType.Number, component: NumberInputComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    FormlyNgZorroAntdModule,
    NzInputModule,
  ],
  exports: [FormlyModule]
})
export class DynamicFormModule {
}
