import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

@Component({
  selector: 'text-align',
  templateUrl: './text-align.component.html',
  styleUrls: ['./text-align.component.scss']
})
export class TextAlignComponent extends FieldType {
  directions = [TextAlign.Left, TextAlign.Center, TextAlign.Right];

  isSelected(item: string) {
    return this.formControl?.value === item;
  }

  select(item: string) {
    this.formControl.patchValue(item);
  }
}
