import { Component, EventEmitter, forwardRef, Injector, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { ConnectionsRepository } from 'trading';

@Component({
  selector: 'account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountFormComponent),
      multi: true,
    }
  ]
})
@UntilDestroy()
export class AccountFormComponent extends ItemsComponent<any> implements OnInit, ControlValueAccessor {

  @Input() isSubmitted = true;

  @Output() autoSavePasswordChange = new EventEmitter<boolean>();

  passwordVisible = true;
  @Output() updateItem = new EventEmitter<boolean>();

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    server: new FormControl(null, Validators.required),
    gateway: new FormControl(null, Validators.required),
    autoSavePassword: new FormControl(true),
  });

  get gateways() {
    return this.items.find(i => i.name === this.form.controls.server.value)?.gateways ?? [];
  }

  get autoSave() {
    return this.form.value.autoSavePassword;
  }

  get isValid() {
    return this.form.valid;
  }

  constructor(
    protected _repository: ConnectionsRepository,
    protected _injector: Injector,
  ) {
    super();
    this.config.autoLoadData = {
      onInit: true,
      onParamsChange: false,
      onQueryParamsChange: false,
    };
  }

  ngOnInit() {
    super.ngOnInit();

    const controls = this.form.controls;
    controls.server.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        controls.gateway.patchValue(this.items.find(i => i.name == value)?.gateways[0]?.name);
      });
  }

  makeAutoSave() {
    this.form.patchValue({ autoSavePassword: true });
  }

  toggleAutoSave() {
    const autoSavePassword = !this.autoSave;
    this.form.patchValue({ autoSavePassword });

    this.autoSavePasswordChange.emit(autoSavePassword);
    this.updateItem.emit();
  }

  getName(o) {
    return o?.name;
  }

  protected _getItems(): Observable<IPaginationResponse> {
    return (this.repository as ConnectionsRepository).getServers();
  }

  onServerSwitch(gateways) {
    if (gateways) {
      const gateway = gateways[gateways.length - 1].name;
      this.form.patchValue({ gateway });
    }
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
    if (!obj)
      return;

    this.form.patchValue(obj);
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  isInvalid(name: any) {
    return this.form.controls[name].invalid;
  }
}
