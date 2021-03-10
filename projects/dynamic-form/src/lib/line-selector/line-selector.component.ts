import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormControl, FormGroup } from '@angular/forms';

export enum LineStyle {
  SOLID = 'solid',
  DASH = 'dash',
  DOT = 'dot',
}

@Component({
  selector: 'line-selector',
  templateUrl: './line-selector.component.html',
  styleUrls: ['./line-selector.component.scss']
})
@UntilDestroy()
export class LineSelectorComponent extends FieldType implements OnInit {

  lineOptions = Object.values(LineStyle);
  width = 1;
  lineStyle = LineStyle.SOLID;
  lineForm = new FormGroup({
    width: new FormControl(this.width),
    lineStyle: new FormControl(this.lineStyle),
  });

  ngOnInit() {
    const value = this.formControl.value;
    if (value?.width) {
      this.width = value.width;
    }
    this.lineForm.patchValue({ width: this.width});
    if (value?.lineStyle) {
      this.lineForm.patchValue({ lineStyle: value.lineStyle });
      this.lineStyle = value.lineStyle;
    }
    this.lineForm.valueChanges
      .pipe(
        untilDestroyed(this))
      .subscribe((res) => {
        this.formControl.patchValue(this.lineForm.value);
        if (res.width)
          this.width = res.width;
      });
  }

  updateLineStyle(value: any) {
    this.lineStyle = value;
    this.lineForm.patchValue({ lineStyle: value });
  }

  updateWidth($event: any) {
    this.width = $event;
    this.lineForm.patchValue({ width: $event });
  }
}
