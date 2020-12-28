import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export enum SlType {
  MKT = 'MKT',
  LMT = 'LMT',
}

@Component({
  selector: 'sl-ticks',
  templateUrl: './sl-ticks.component.html',
  styleUrls: ['./sl-ticks.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlTicksComponent),
      multi: true
    }
  ]
})
@UntilDestroy()
export class SlTicksComponent implements ControlValueAccessor {
  showAmount = false;
  slType = SlType;
  form = new FormGroup({
    stopLoss: new FormControl(false),
    type: new FormControl(),
    unit: new FormControl(),
    count: new FormControl(),
    amount: new FormControl(),
  });

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(res => fn(res));

  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj)
      this.form.patchValue(obj);
  }

  updateType(type: SlType) {
    this.form.patchValue({type});
  }

  isCurrentType(type: SlType) {
    return this.form.value.type === type;
  }
}
