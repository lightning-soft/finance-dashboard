import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

const Palette: string[][] = [
  ['#FFE8E8', '#F68E8E', '#F16E6E', '#E95050', '#EA3939', '#DD2121', '#CB1212', '#BC0606', '#9D0A0A', '#820303'],
  ['#FFE0CF', '#FFBB96', '#FFA16D', '#FF8440', '#FF6C1C', '#FF5A00', '#E04F00', '#C04400', '#9C3700', '#802D00'],
];

@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent extends FieldType {
  readonly palette: string[][] = Palette;

  updateValue($event: string) {
    if (!this.formControl.disabled)
      this.formControl.patchValue($event);
  }

  changeColor(color: string): void {
    this.formControl.setValue(color);
  }
}
