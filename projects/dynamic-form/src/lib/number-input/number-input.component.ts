import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { NzInputNumberComponent } from "ng-zorro-antd";

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent extends FieldType implements AfterViewInit {
  @ViewChild(NzInputNumberComponent) input: NzInputNumberComponent;
  max: number;
  min: number;

  get value() {
    return this.formControl.value;
  }

  set value(value) {
    if (value != null && this.isAboveMin(value) && this.isBelowMax(value))
      this.formControl.patchValue(value);
  }

  ngAfterViewInit() {
    if (this.field.templateOptions?.max != null)
      this.max = this.field.templateOptions.max;
    if (this.field.templateOptions?.min != null)
      this.min = this.field.templateOptions.min;
  }


  isAboveMin(value): boolean {
    return this.min == null || value >= this.min;
  }

  isBelowMax(value): boolean {
    return this.max == null || value <= this.max;
  }
}
