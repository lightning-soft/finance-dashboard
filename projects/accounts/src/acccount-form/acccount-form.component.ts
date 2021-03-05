import { Component, forwardRef, Injectable, Input, OnInit, Injector } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HttpRepository, IPaginationResponse } from 'communication';
import { ConnectionsRepository } from 'trading';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemsComponent } from '../../../base-components/src/components/items.component';

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
export class AcccountFormComponent extends ItemsComponent<any> implements OnInit, ControlValueAccessor {
  get gateways() {
    return this.items.find(i => i.name === this.form.controls.server.value)?.gateways ?? []
  }

  get autoSave() {
    return this.form.value.autoSavePassword;
  }

  get isValid() {
    return this.form.valid;
  }

  @Input() isSubmitted = false;

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    server: new FormControl(null, Validators.required),
    gateway: new FormControl(null, Validators.required),
    autoSavePassword: new FormControl(false),
  });

  passwordVisible = true;

  constructor(protected _repository: ServersRepository, protected _injector: Injector) {
    super();
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

  toggleAutoSave() {
    const autoSavePassword = !this.autoSave;
    this.form.patchValue({ autoSavePassword });
  }

  getName(o) {
    return o?.name;
  }

  _handleConnection() {

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
    if (obj)
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

@Injectable()
export class ServersRepository extends HttpRepository<any> {
  constructor(private connectionRepository: ConnectionsRepository) {
    super(null, null, null);
  }

  getItems(obj?: any): Observable<IPaginationResponse<any>> {
    return this.connectionRepository.getServers()
      .pipe(
        map((data) => {
          const result = Object.keys(data.result)
            .map((name) => ({ gateways: data.result[name], name }));

          return {
            data: result,
            total: result.length,
            page: 1,
            skip: 0,
            pageCount: 1,
            count: result.length
          } as IPaginationResponse;
        }));
  }
}
