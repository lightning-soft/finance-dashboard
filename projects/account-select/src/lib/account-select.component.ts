import { Component, EventEmitter, Input, Output, Injector } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Id, ItemsComponent } from 'base-components';
import { AccountRepository, IAccount, IConnection } from 'trading';
import { IPaginationResponse } from 'communication';

@UntilDestroy()
@Component({
  selector: 'account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['account-select.component.scss'],
})
export class AccountSelectComponent extends ItemsComponent<IAccount> {

  @Input() placeholder = 'Select account';
  @Input() className = '';
  @Input() size = 'default';
  @Output() accountChange: EventEmitter<Id> = new EventEmitter();

  activeAccountId: Id;

  constructor(
    protected _repository: AccountRepository,
    protected _injector: Injector,
  ) {
    super();
    this.autoLoadData = {
      onConnectionChange: true,
    };

    this._params = { status: 'Active' };
  }

  protected _handleConnection(connection: IConnection) {
    if (!connection) {
      this.activeAccountId = null;
    }
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
