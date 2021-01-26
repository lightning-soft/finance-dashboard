import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule, NzSwitchModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { FieldType } from './field';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { TextAlignComponent } from './text-align/text-align.component';
import { SwitchComponent } from './switch/switch.component';
import { HotkeyComponent } from './hotkey/hotkey.component';


@NgModule({
  declarations: [ColorPickerComponent, NumberInputComponent, TextAlignComponent, SwitchComponent, HotkeyComponent],
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forRoot({
      types: [
        {
          name: FieldType.Hotkey, component: HotkeyComponent,
        },
        {
          name: FieldType.Color, component: ColorPickerComponent,
        },
        {
          name: FieldType.TextAlign, component: TextAlignComponent,
        },
        {
          name: FieldType.Number, component: NumberInputComponent,
        },
        {
          name: FieldType.Switch, component: SwitchComponent,
        }
      ]
    }),
    FormlyNgZorroAntdModule,
    NzInputModule,
    NzSwitchModule,
  ],
  exports: [FormlyModule]
})
export class DynamicFormModule {
}
