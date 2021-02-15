import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent extends FieldType {

  updateValue($event: string) {
    if (!this.formControl.disabled)
      this.formControl.patchValue($event);
  }
}
