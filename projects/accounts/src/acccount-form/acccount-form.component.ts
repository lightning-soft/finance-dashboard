import { Component, forwardRef, Injectable, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { HttpRepository, IPaginationResponse } from "communication";
import { ConnectionsRepository } from "trading";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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
export class AcccountFormComponent implements ControlValueAccessor {
  form = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      server: new FormControl(),
      gateway: new FormControl()
    }
  );
  passwordVisible = true;

  constructor(public serverRepository: ServersRepository,
  ) {

  }

  getName(o) {
    return o.name;
  }

  onServerSwitch(gateways) {
    if (gateways) {
      const gateway = gateways[gateways.length - 1].name;
      this.form.patchValue({gateway});
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
    if (obj) {
      obj.server = {name: obj.server, gateways: [{name: obj.gateway}]};
      this.form.patchValue(obj);
    }
    console.log(obj);
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
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
          const result = Object.keys(data.result).map((key) => {
            const item = {gateways: data.result[key], name: null};
            item.name = key;
            return item;
          });
          console.log(result);
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
