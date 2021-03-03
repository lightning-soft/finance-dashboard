import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'lib-color-select',
  templateUrl: './color-select.component.html',
  styleUrls: ['./color-select.component.scss']
})
export class ColorSelectComponent extends FieldType {
  updateValue(item, $event: string) {
    item.value.color = $event;
    if (this.formControl.value.type === item.value.type) {
      this.formControl.patchValue(item.value);
    }
  }
}
