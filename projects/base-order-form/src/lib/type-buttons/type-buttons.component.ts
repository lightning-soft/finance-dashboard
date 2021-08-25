import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ITypeButton {
  label: string;
  value: any;
  selectable: boolean;
  visible: boolean;
  black?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  contextMenu?: () => void;
}

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
  @Input() typeButtons: ITypeButton[] = [];
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

  onClick(item: ITypeButton) {
    if (item.onClick)
      item.onClick();
    if (item.selectable)
      this.updateValue(item);
  }
}
