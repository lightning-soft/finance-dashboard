import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { Id, ItemComponent } from 'base-components';
import { IPaginationResponse } from 'communication';
import { AccountRepository, IAccount } from 'trading';

@UntilDestroy()
@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
export class AccountSelectComponent extends ItemComponent<IAccount> implements OnInit {

  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() size = 'default';
  @Output() accountChange: EventEmitter<Id> = new EventEmitter();

  activeAccount: Id;

  accounts: IAccount[] = [];

  constructor(
    protected _repository: AccountRepository,
    protected _accountsManager: AccountsManager,
  ) {
    super();
  }

  ngOnInit(): void {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._repository = this._repository.forConnection(connection);
      });

    this._repository.getItems({ status: 'Active' })
      .pipe(untilDestroyed(this))
      .subscribe((response: IPaginationResponse<IAccount>) => {
        this.accounts = response.data;

        this.select(this.accounts[0].id);
      });

    super.ngOnInit();
  }

  select(id: Id): void {
    this.activeAccount = id;
    this.accountChange.emit(id);
  }

}
