import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FieldConfig, FieldType } from '../field';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicFieldComponent),
      multi: true,
    }
  ]
})
export class DynamicFieldComponent implements OnInit, ControlValueAccessor {
  @Input() field: FieldConfig;
  fieldsTypes = FieldType;
  _value;
  _onChange: Function;
  _checkBoxList;

  set checkBoxList(value) {
    this._checkBoxList = value;
    this.value = value.filter(item => item.checked).map(item => item.value);
  }

  get checkBoxList() {
    return this._checkBoxList;
  }

  set value(value) {
    this._value = value;
    if (this._onChange)
      this._onChange(value);
  }

  get value() {
    return this._value;

  }

  constructor() {
  }

  ngOnInit(): void {
    this.value = this.field.value;
    if (this.field.type === FieldType.Checkbox) {
      this._checkBoxList = this.field.options.map(item => {
        return {label: item, value: item, checked: isChecked(item, this.value)};
      });
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
    this._value = obj;
  }
}

const isChecked = (item, value): boolean => {
  if (Array.isArray(value))
    return value.includes(item);

  return item === value;
};
