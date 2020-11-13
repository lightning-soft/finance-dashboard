import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { Id, ItemsComponent } from 'base-components';
import { AccountRepository, IAccount } from 'trading';

@UntilDestroy()
@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
export class AccountSelectComponent extends ItemsComponent<IAccount> implements OnInit {

  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() size = 'default';
  @Output() accountChange: EventEmitter<Id> = new EventEmitter();

  activeAccount: Id;

  get loading(): boolean {
    return this._loading;
  }

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
        this.repository = this._repository.forConnection(connection);
      });

    this.loadData({...this._params, status: 'Active'});
    super.ngOnInit();
  }

  select(id: Id): void {
    this.activeAccount = id;
    this.accountChange.emit(id);
  }

}
