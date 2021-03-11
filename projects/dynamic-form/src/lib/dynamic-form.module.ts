import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDividerModule, NzInputModule, NzInputNumberModule, NzSelectModule, NzSwitchModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { FieldType } from './field';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { TextAlignComponent } from './text-align/text-align.component';
import { SwitchComponent } from './switch/switch.component';
import { HotkeyComponent } from './hotkey/hotkey.component';
import { HotkeyInputModule } from '../../../hotkey-input';
import { SelectComponent } from './select/select.component';
import { ColorSelectComponent } from './color-select/color-select.component';
import { LineSelectorComponent } from './line-selector/line-selector.component';

const formlyComponents = [
  {
    name: FieldType.Select, component: SelectComponent,
  },
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
  },
  {
    name: FieldType.ColorSelect, component: ColorSelectComponent,
  },
  {
    name: FieldType.LineSelector, component: LineSelectorComponent,
  }
];

@NgModule({
  declarations: [ColorPickerComponent, NumberInputComponent, TextAlignComponent,
    SwitchComponent, HotkeyComponent, SelectComponent, ColorSelectComponent, LineSelectorComponent],
  imports: [
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forRoot({
      types: formlyComponents,
    }),
    HotkeyInputModule,
    FormlyNgZorroAntdModule,
    NzInputModule,
    NzSwitchModule,
    NzSelectModule,
    NzDividerModule,
    NzInputNumberModule,
  ],
  exports: [FormlyModule]
})
export class DynamicFormModule {
}
