import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FormComponent } from 'base-components';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AccountRepository, IAccount } from 'trading';
import { AccountsService } from '../accounts.service';

enum FromStatus {
  VALID = 'VALID',
  INVALID = 'INVALID'
}

export interface IConnectionResponse {
  result: boolean;
  error: object | null;
}

export interface IFormValues {
  password: string;
  login: string;
  server: string;
  broker: string;
}
@Component({
  selector: 'app-account-connect',
  templateUrl: './account-connect.component.html',
  styleUrls: ['./account-connect.component.scss']
})
export class AccountConnectComponent extends FormComponent<any> implements OnDestroy {

  // Stop native call to method '_create()'
  public needCreate = false;

  public isLoading = false;

  public errMessage: string;

  constructor(
    private modal: NzModalRef,
    public _repository: AccountRepository,
    private _accountService: AccountsService,
  ) {
    super();
  }

  protected createForm(): FormGroup {
    return new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      login: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      // server: new FormControl(null, [Validators.required]),
      // repeatPassword: new FormControl(null, [Validators.required]),
      // broker: new FormControl(null, [Validators.required]),

      // password: new FormControl(),
      // login: new FormControl(),
      // server: new FormControl(),
      // repeatPassword: new FormControl(),
      // broker: new FormControl(),
    });
    // }, this._checkPasswords);
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public async handleSubmit() {
    try {
      if (this.form.status === FromStatus.INVALID) throw new Error('Check your data and try again');

      const newAccount: IAccount = {
        name: this.formValue.login,
        account: this.formValue.login,
        server: this.formValue.server,
        id: Date.now(),
      };

      this.showSpinner();

      this._accountService
        .createAccount(newAccount, this.formValue.password)
        .subscribe({
          next: (response: IConnectionResponse) => {
            console.log(response, '<-- Valid response');
            this.hideSpinner();
            this._repository.createItem(newAccount);
            this.modal.close(newAccount);
          },
          error: err => {
            console.error(err);
            this.hideSpinner();
            this.errMessage = err.message;
          }
        });

    } catch (error) {
      if (error.message === FromStatus.INVALID) console.log('Invalid form');
      this.errMessage = 'Check your data and try again!';
    }
  }

  private _checkPasswords(group: FormGroup): ValidationErrors | null {
    const pass = group.get('password').value;
    const repeatPassword = group.get('repeatPassword').value;

    return pass === repeatPassword ? null : { notSame: true };
  }

  public showSpinner(): void {
    this.isLoading = true;
  }

  public hideSpinner(): void {
    this.isLoading = false;
  }

}
