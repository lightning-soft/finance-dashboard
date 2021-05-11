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

  get value() {
    return this.formControl.value;
  }

  set value(value) {
    if (this.isAboveMin(value) && this.isBelowMax(value))
      this.formControl.patchValue(value);
  }

  ngAfterViewInit() {
    this._decorateFunctions();
  }

  isAboveMin(value): boolean {
    return this.field.templateOptions?.min == null || value >= this.field.templateOptions.min;
  }

  isBelowMax(value): boolean {
    return this.field.templateOptions?.max == null || value <= this.field.templateOptions.max;
  }

  private _decorateFunctions(): void {
    const originalUpFunc = this.input.up.bind(this.input);
    const originalDownFunc = this.input.down.bind(this.input);

    this.input.up = (event, ration) => {
      originalUpFunc(event, ration);
      this.input.blur();
    }

    this.input.down = (event, ration) => {
      originalDownFunc(event, ration);
      this.input.blur();
    }
  }
}
