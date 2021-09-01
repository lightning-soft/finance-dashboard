import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NzCheckboxModule,
  NzDatePickerModule,
  NzDividerModule,
  NzDropDownModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzSelectModule,
  NzSliderModule,
  NzSwitchModule
} from 'ng-zorro-antd';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { FieldType } from './field';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { TextAlignComponent } from './text-align/text-align.component';
import { SwitchComponent } from './switch/switch.component';
import { HotkeyComponent } from './hotkey/hotkey.component';
import { HotkeyInputModule } from 'hotkey-input';
import { SelectComponent } from './select/select.component';
import { ColorSelectComponent } from './color-select/color-select.component';
import { LineSelectorComponent } from './line-selector/line-selector.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { StorageModule } from 'storage';
import { ColumnSelectorComponent } from './column-selector/column-selector.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LabelComponent } from './label/label.component';
import { DataBoxComponent } from './data-box/data-box.component';
import { SessionsSelectComponent } from './sessions-select/sessions-select.component';
import { DataSelectModule } from 'data-select';
import { DragAndDropComponent } from './drag-and-drop/drag-and-drop.component';

const formlyComponents = [
  {
    name: FieldType.Select, component: SelectComponent,
  },
  {
    name: FieldType.DatePicker, component: DatepickerComponent,
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
  },
  {
    name: FieldType.ColumnSelector, component: ColumnSelectorComponent,
  },
  {
    name: FieldType.Label, component: LabelComponent,
  },
  {
    name: FieldType.DataBox, component: DataBoxComponent,
  },
  {
    name: FieldType.SessionsSelect,
    component: SessionsSelectComponent,
  },
  { name: FieldType.DragAndDrop, component: DragAndDropComponent },
];

@NgModule({
  declarations: [
    ColorPickerComponent, NumberInputComponent, TextAlignComponent,
    SwitchComponent, HotkeyComponent, SelectComponent, ColorSelectComponent,
    SessionsSelectComponent,
    LineSelectorComponent, DatepickerComponent, ColumnSelectorComponent, LabelComponent, DataBoxComponent, DragAndDropComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataSelectModule,
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
    NzDatePickerModule,
    NzDropDownModule,
    NzSliderModule,
    StorageModule,
    NzCheckboxModule,
    NzFormModule,
    DragDropModule,
  ],
  exports: [FormlyModule]
})
export class DynamicFormModule {
}
