import { Component, EventEmitter, Input, OnInit, Output, Injector } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { Id, ItemsComponent } from 'base-components';
import { AccountRepository, IAccount } from 'trading';
import { IPaginationResponse } from 'communication';

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

  activeAccountId: Id;

  constructor(
    protected _repository: AccountRepository,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector,
  ) {
    super();
  }

  ngOnInit(): void {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._repository = this._repository.forConnection(connection);

        this.loadData({ ...this._params, status: 'Active' });
      });

    super.ngOnInit();
  }

  protected _handleResponse(response: IPaginationResponse<IAccount>, params: any) {
    super._handleResponse(response, params);
    if (this.items.every((item) => item.id !== this.activeAccountId)) {
      const item = this.items[0];
      this.select(item?.id);
    }
  }

  select(id: Id): void {
    if (this.activeAccountId === id)
      return;

    this.activeAccountId = id;
    this.accountChange.emit(id);
  }
}
