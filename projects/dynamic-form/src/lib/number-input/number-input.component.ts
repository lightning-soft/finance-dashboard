import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent extends FieldType {
  get value() {
    return this.formControl.value;
  }

  set value(value) {
    if (this.isAboveMin(value) && this.isBelowMax(value))
      this.formControl.patchValue(value);
  }

  isAboveMin(value) {
    return this.field.templateOptions?.min == null || value >= this.field.templateOptions.min;
  }

  isBelowMax(value) {
    return this.field.templateOptions?.max == null || value <= this.field.templateOptions.max;
  }
}
