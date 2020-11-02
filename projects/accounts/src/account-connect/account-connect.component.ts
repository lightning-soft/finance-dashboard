import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FormComponent } from 'base-components';
import { RithmicApiService, WebSocketService } from 'communication';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AccountRepository } from 'trading';

@Component({
  selector: 'app-account-connect',
  templateUrl: './account-connect.component.html',
  styleUrls: ['./account-connect.component.scss']
})
export class AccountConnectComponent extends FormComponent<any> implements OnDestroy {
  public needCreate = false;
  public isLoading = false;
  public errMessage: string;

  constructor(
    protected _repository: AccountRepository,
    private _modal: NzModalRef,
    private _rithmicApiService: RithmicApiService,
    private _webSocketService: WebSocketService
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
    });
    // }, this._checkPasswords);
  }

  public handleCancel(): void {
    this._modal.close();
  }

  public async handleSubmit() {
    if (this.form.invalid) {
      this.errMessage = 'Check your data and try again!';

      return;
    }

    this.errMessage = '';

    this.showSpinner();

    const { login, password } = this.formValue;

    this._rithmicApiService.login(login, password).subscribe(
      () => {
        this._webSocketService.connect({ url: 'wss://rithmic-dev.amstradinggroup.com/api/market' });
        this._modal.close();
        this.hideSpinner();
      },
      (e) => {
        this.errMessage = e.message;
        this.hideSpinner();
      },
    );
  }

  public showSpinner(): void {
    this.isLoading = true;
  }

  public hideSpinner(): void {
    this.isLoading = false;
  }

  private _checkPasswords(group: FormGroup): ValidationErrors | null {
    const pass = group.get('password').value;
    const repeatPassword = group.get('repeatPassword').value;

    return pass === repeatPassword ? null : { notSame: true };
  }
}
