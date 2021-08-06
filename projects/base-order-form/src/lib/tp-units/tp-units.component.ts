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
    unitItem: new FormControl(),
    unit: new FormControl()
  });
  @Input() overlayClass = '';

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        res[res.unit] = res.unitItem;
        fn(res);
      });
  }

  getTitle() {
    return `TP: ${ this.form.getRawValue().unitItem } ${ this.form.value.unit }`;
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
    const { unitItem, unit } = this.form.controls;
    if ($event) {
      unitItem.enable();
      unit.enable();
    } else {
      unitItem.disable();
      unit.disable();
    }
  }
}
