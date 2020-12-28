import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'quantity-buttons',
  templateUrl: './quantity-buttons.component.html',
  styleUrls: ['./quantity-buttons.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantityButtonsComponent),
      multi: true,
    }
  ]
})
export class QuantityButtonsComponent implements ControlValueAccessor {
  @Input() amountButtons = [];
  onChange;
  currentValue: number;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    this.currentValue = obj;
  }

  updateValue(item: any) {
    this.currentValue = item.label;
    this.onChange(item.label);
  }

  isCurrentValue(item: any) {
    return this.currentValue === item.label;
  }
}
