import { Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { NzInputNumberComponent } from 'ng-zorro-antd';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent extends FieldType {
  @ViewChild(NzInputNumberComponent) input: NzInputNumberComponent;

  get max() {
    return this.field.templateOptions?.max ?? Infinity;
  }

  get min() {
    return this.field.templateOptions?.min ?? -Infinity;
  }

  get value() {
    return this.formControl.value;
  }

  get precision() {
    return this.field.templateOptions?.precision ?? 5;
  }

  set value(value) {
    if (value != null)
      this.formControl.patchValue(value);
  }


  isAboveMin(value): boolean {
    return this.min == null || value >= this.min;
  }

  isBelowMax(value): boolean {
    return this.max == null || value <= this.max;
  }
}
