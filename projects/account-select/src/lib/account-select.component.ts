import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Id, ILoadingHandler } from 'base-components';
import { AccountsListener } from 'real-trading';
import { IAccount } from 'trading';


@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
@AccountsListener()
export class AccountSelectComponent {
  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() nzDropdownClassName = '';
  @Input() loadingHandler: ILoadingHandler;
  @Output() accountChange: EventEmitter<IAccount> = new EventEmitter();

  items: IAccount[] = [];

  private _account: IAccount;

  public get account(): IAccount {
    return this._account;
  }

  @Input()
  public set account(value: IAccount) {
    if (this._account?.id === value?.id)
      return;

    this.accountChange.emit(value);
    this._account = value;
  }

  @Input() labelTransformer = (label) => label;

  handleAccountsConnect(accounts: IAccount[], allAccounts: IAccount[]) {
    this.items = allAccounts;

    if (this.account == null)
      this.account = allAccounts[0];
  }

  handleAccountsDisconnect(disconnectedAccounts: IAccount[], allAccounts: IAccount[]) {
    this.items = allAccounts;

    if (disconnectedAccounts.some(account => this.account.id === account.id)) {
      this.account = allAccounts[0];
    }
  }

  compareAccounts(a: IAccount, b: IAccount): boolean {
    return a?.id === b?.id;
  }
}
