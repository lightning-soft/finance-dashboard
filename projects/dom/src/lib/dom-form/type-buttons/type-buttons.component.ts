import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'type-buttons',
  templateUrl: './type-buttons.component.html',
  styleUrls: ['./type-buttons.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeButtonsComponent),
      multi: true,
    }
  ]
})
export class TypeButtonsComponent implements ControlValueAccessor {
  @Input() typeButtons = [];
  onChange;
  private currentValue: any;


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    this.currentValue = obj;

  }

  updateValue(item) {
    this.currentValue = item.value;
    this.onChange(item.value);
  }

  isCurrentValue(item: any) {
    return this.currentValue === item.value;
  }
}
