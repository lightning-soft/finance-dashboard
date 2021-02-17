import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'tp-units',
  templateUrl: './tp-units.component.html',
  styleUrls: ['./tp-units.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TpUnitsComponent),
      multi: true
    }
  ]
})
@UntilDestroy()
export class TpUnitsComponent implements ControlValueAccessor {
  form = new FormGroup({
    takeProfit: new FormControl(false),
    ticks: new FormControl(),
    unit: new FormControl()
  });
  @Input() overlayClass = '';

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(res => fn(res));
  }
  getTitle() {
    return  `TP: ${this.form.getRawValue().ticks} ${this.form.value.unit}`;
  }
  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj) {
      this.form.patchValue(obj);
      this.onValueChange(obj.takeProfit);
    }
  }

  onValueChange($event: boolean) {
    const { ticks } = this.form.controls;
    if ($event)
      ticks.enable();
    else
      ticks.disable();
  }
}
