import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormComponent} from 'core';
import {FormControl, FormGroup} from '@angular/forms';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-account-connect',
  templateUrl: './account-connect.component.html',
  styleUrls: ['./account-connect.component.scss']
})
export class AccountConnectComponent extends FormComponent<any> implements OnDestroy{

  constructor(private modal: NzModalRef,
  ) {
    super();
  }


  protected createForm(): FormGroup {
    return new FormGroup({
      password: new FormControl(),
      login: new FormControl(),
      server: new FormControl(),
      repeatPassword: new FormControl(),
      broker: new FormControl(),
    });
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    this.modal.destroy();
  }
}
