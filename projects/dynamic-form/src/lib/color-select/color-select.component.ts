import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'lib-color-select',
  templateUrl: './color-select.component.html',
  styleUrls: ['./color-select.component.scss']
})
export class ColorSelectComponent extends FieldType {
  compareItems(a, b) {
    return a?.type === b?.type;
  }

  updateValue($event: string) {
    this.formControl.setValue({
      type: this.formControl.value.type,
      value: $event,
    });
  }
}
