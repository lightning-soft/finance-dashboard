import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@Component({
  selector: 'acccount-form',
  templateUrl: './acccount-form.component.html',
  styleUrls: ['./acccount-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AcccountFormComponent),
      multi: true,
    }
  ]
})
@UntilDestroy()
export class AcccountFormComponent implements OnInit, ControlValueAccessor {
  form = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      connectionPointId: new FormControl(),
      gateway: new FormControl()
    }
  );
  passwordVisible = true;

  constructor() {
  }

  ngOnInit(): void {
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        fn(res);
      });
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj) {
      this.form.patchValue(obj);
    }
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

}
