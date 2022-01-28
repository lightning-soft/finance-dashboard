import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrderType } from 'trading';

export enum SlType {
  MKT = OrderType.StopMarket,
  LMT = OrderType.StopLimit,
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
    type: new FormControl(SlType.MKT),
    unitItem: new FormControl(),
    unit: new FormControl(),
    amount: new FormControl(1),
  });
  isDisabled = true;

  @Input() overlayClass = '';

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        res[res.unit] = res.unitItem;
        fn(res);
      });
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
    this.form.patchValue({ type });
  }

  isCurrentType(type: SlType) {
    return this.form.value.type === type;
  }

  onValueChange($event: boolean) {
    const { unitItem, unit, amount  } = this.form.controls;
    const controls = [unitItem, unit, amount];
    if ($event) {
      this.isDisabled = false;
      controls.forEach(item => item.enable());
    }
    else {
      controls.forEach(item => item.disable());
      this.isDisabled = true;

    }
  }

  getTitle() {
    return `SL: ${ this.form.getRawValue().unitItem } ${ this.form.value.unit }`;
  }
}
