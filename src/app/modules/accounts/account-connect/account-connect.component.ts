import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FormComponent } from 'core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AccountRepository } from '../../communication';
import { AccountsService } from '../accounts.service';

enum FromStatus {
  VALID = 'VALID',
  INVALID = 'INVALID'
}

export interface IFormValues {
  password: string;
  login: string;
  server: string;
  repeatPassword: string;
  broker: string;
}
@Component({
  selector: 'app-account-connect',
  templateUrl: './account-connect.component.html',
  styleUrls: ['./account-connect.component.scss']
})
export class AccountConnectComponent extends FormComponent<any> implements OnDestroy {

  constructor(
    private modal: NzModalRef,
    public _repository: AccountRepository,
    private _accountService: AccountsService
  ) {
    super();
  }

  protected createForm(): FormGroup {
    return new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      login: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      server: new FormControl(null, [Validators.required]),
      repeatPassword: new FormControl(null, [Validators.required]),
      broker: new FormControl(null, [Validators.required]),
    }, this._checkPasswords);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.modal.destroy();
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public async handleSubmit() {
    try {
      if (this.form.status !== FromStatus.VALID) throw new Error(FromStatus.INVALID);

      this._accountService
        .request(this.formValue as IFormValues)
        .subscribe({
          next: response => {
            console.log(response, '<-- Here');
          },
          error: err => {
            console.error(err);
            this.modal.updateConfig({ nzTitle: err.message });
          }
        });

    } catch (error) {
      if (error.message === FromStatus.INVALID) console.log('Invalid form');
      this.modal.updateConfig({ nzTitle: 'Alert!' });
    }
  }

  private _checkPasswords(group: FormGroup): ValidationErrors | null {
    const pass = group.get('password').value;
    const repeatPassword = group.get('repeatPassword').value;

    return pass === repeatPassword ? null : { notSame: true };
  }

}
