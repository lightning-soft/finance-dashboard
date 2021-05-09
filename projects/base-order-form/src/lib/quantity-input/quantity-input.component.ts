import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuantityPositions } from 'dom';

export enum AddQuantityMode {
  AddToCurrent,
  Rewrite,
}

@Component({
  selector: 'quantity-input',
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantityInputComponent),
      multi: true,
    }
  ]
})
export class QuantityInputComponent implements ControlValueAccessor {
  @Input() amountButtons = [];
  @Input() allowEdit = true;
  onChange;
  currentValue: number;
  currentItem: any;
  @Input() addMode: AddQuantityMode = AddQuantityMode.Rewrite;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    this.currentValue = obj;
  }

  updateValue(value) {
    this.currentValue = value;
    this.onChange(value);
  }

  updateItem(item: any) {
    this.currentItem = item;
    this.updateValue(item.value);
  }

  isCurrentValue(item: any) {
    return this.currentValue === item.value;
  }

  selectByPosition(position: QuantityPositions): void {
    const item = this.amountButtons[position];
    this.updateItem(item);
  }

  editButton(item: any) {
    if (this.allowEdit)
      item.edit = true;
  }

  isSelected(item: any) {
    return this.currentItem === item;
  }

  setValue(item: any) {
    if (this.addMode === AddQuantityMode.AddToCurrent) {
      this.currentValue += item.value;
    } else if (this.addMode === AddQuantityMode.Rewrite) {
      this.currentValue = item.value;
    }

    this.onChange(this.currentValue);
  }
}
