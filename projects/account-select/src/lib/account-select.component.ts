import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILoadingHandler } from 'base-components';
import { AccountListener, IAccountListener } from 'real-trading';
import { IAccount } from 'trading';

export interface AccountSelectComponent extends IAccountListener {

}

@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
@AccountListener()
export class AccountSelectComponent {
  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() nzDropdownClassName = '';
  @Input() loadingHandler: ILoadingHandler;
  @Output() accountChange: EventEmitter<IAccount> = new EventEmitter();

  @Input() selectFirstAsDefault: boolean;

  private _account: IAccount;

  public get account(): IAccount {
    return this._account;
  }

  onAccountChanged() {
    if (!this.accounts.some(item => item.id === this._account?.id)) {
      this.account = null; //this.accounts.length ? this.accounts[0] : null;
    }
  }

  @Input()
  public set account(value: IAccount) {
    if (this._account?.id === value?.id)
      return;

    this.accountChange.emit(value);
    this._account = value;
  }

  get items(): IAccount[] {
    return this.accounts ?? [];
  }

  @Input() labelTransformer = (label) => label;
  @Input() isOpened = false;

  compareAccounts(a: IAccount, b: IAccount): boolean {
    return a?.id === b?.id;
  }
}
