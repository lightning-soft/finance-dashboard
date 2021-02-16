import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export enum SlType {
  MKT = 'MKT',
  LMT = 'LMT',
}

@Component({
  selector: 'sl-units',
  templateUrl: './sl-units.component.html',
  styleUrls: ['./sl-units.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlUnitsComponent),
      multi: true
    }
  ]
})
@UntilDestroy()
export class SlUnitsComponent implements ControlValueAccessor {
  showAmount = false;
  slType = SlType;
  form = new FormGroup({
    stopLoss: new FormControl(false),
    type: new FormControl(),
    ticks: new FormControl(),
    unit: new FormControl(),
    amount: new FormControl(),
  });

  @Input() overlayClass = '';

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(res => fn(res));
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj) {
      this.form.patchValue(obj);
      this.onValueChange(obj.stopLoss);
    }
  }

  updateType(type: SlType) {
    this.form.patchValue({type});
  }

  isCurrentType(type: SlType) {
    return this.form.value.type === type;
  }

  onValueChange($event: boolean) {
    const { ticks } = this.form.controls;
    if ($event)
      ticks.enable();
    else
      ticks.disable();
  }

  getTitle() {
   return  `SL: ${this.form.getRawValue().ticks} ${this.form.value.unit}`;
  }
}
