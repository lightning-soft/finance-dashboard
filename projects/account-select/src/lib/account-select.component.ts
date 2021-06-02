import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountNode, AccountNodeSubscriber, AccountsManager, IAccountNodeData } from 'accounts-manager';
import { Id, ILoadingHandler } from 'base-components';
import { IAccount } from 'trading';


@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
export class AccountSelectComponent extends AccountNodeSubscriber implements OnInit {
  @Input() node: AccountNode;
  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() nzDropdownClassName = '';
  @Input() loadingHandler: ILoadingHandler;
  @Output() accountChange: EventEmitter<Id> = new EventEmitter();

  items: IAccount[] = [];

  get activeAccount(): IAccount {
    return this.node.account;
  }

  set activeAccount(value: IAccount) {
    if (!this.compareAccounts(this.node.account, value)) {
      this._accountsManager.changeNodeAccount(this.node, value);
    }
  }

  @Input() labelTransformer = (label) => label;

  constructor(
    private _accountsManager: AccountsManager,
  ) {
    super();
  }

  ngOnInit() {
    this._accountsManager.subscribe(this.node, this);
  }

  handleAccountsChange(data: IAccountNodeData<IAccount>) {
    super.handleAccountsChange(data);

    this.items = data.current;

    if (!this.activeAccount || !this.items.find(i => this.compareAccounts(i, this.activeAccount))) {
      this.activeAccount = this.items[0];
    }
  }

  compareAccounts(a: IAccount, b: IAccount): boolean {
    return a?.id === b?.id;
  }
}
