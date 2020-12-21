import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'text-align',
  templateUrl: './text-align.component.html',
  styleUrls: ['./text-align.component.scss']
})
export class TextAlignComponent extends FieldType {
  directions = ['left', 'center', 'right'];

  isSelected(item: string) {
    return this.formControl.value === item;
  }

  select(item: string) {
    this.formControl.patchValue(item);
  }
}
