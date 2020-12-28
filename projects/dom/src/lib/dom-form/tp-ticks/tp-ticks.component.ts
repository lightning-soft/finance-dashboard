import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'tp-ticks',
  templateUrl: './tp-ticks.component.html',
  styleUrls: ['./tp-ticks.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TpTicksComponent),
      multi: true
    }
  ]
})
@UntilDestroy()
export class TpTicksComponent implements ControlValueAccessor {
  form = new FormGroup({
    takeProfit: new FormControl(false),
    unit: new FormControl(),
    count: new FormControl()
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

}
