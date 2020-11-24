import { Component, Injector } from '@angular/core';
import { GroupItemsBuilder, ItemsComponent } from 'base-components';
import { Id } from 'communication';

import {
  CellClickDataGridHandler,
  Column,
  DataCell
} from 'data-grid';

import { LayoutNode } from 'layout';

import {
  IPosition,
  IPositionParams,
  PositionsRepository,
  PositionStatus,
} from 'trading';

import { PositionItem } from './models/position.item';


const headers = [
  'account',
  'price',
  'size',
  'realized',
  'unrealized',
  'total',
];

@Component({
  selector: 'position-list',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
@LayoutNode()
export class PositionsComponent extends ItemsComponent<IPosition> {
  builder = new GroupItemsBuilder();

  private _columns: Column[] = [];

  get columns() {
    const closeColumn: Column = {
      name: 'Close',
      visible: true,
    };

    return this.status === PositionStatus.Open ? this._columns.concat(closeColumn) : this._columns;
  }

  private _isList = true;

  set isList(isList) {
    this._isList = isList;

    if (!isList) {
      this.groupItems();
    } else {
      this.builder.ungroupItems();
    }
  }

  get isList() {
    return this._isList;
  }

  private _status: PositionStatus = PositionStatus.Open;

  get status() {
    return this._status;
  }

  set status(value: PositionStatus) {
    if (value === this.status) {
      return;
    }
    this._status = value;
    this.refresh();
  }

  get params(): IPositionParams {
    return { ...this._params, status: this.status };
  }

  private _accountId;

  set accountId(accountId) {
    this._accountId = accountId;
    this.loadData({ accountId });
  }

  get accountId() {
    return this._accountId;
  }

  handlers = [
    new CellClickDataGridHandler<PositionItem>({
      column: 'close',
      handler: (item) => this.delete(item),
    }),
  ];

  constructor(
    protected _repository: PositionsRepository,
    protected _injector: Injector,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      groupBy: ['account'],
      order: 'desc',
      filter: (item: IPosition) => item.status === this.status,
      map: (item: IPosition) => new PositionItem(item),
    });

    this._columns = headers.map(header => ({ name: header, visible: true }));
  }

  groupItems() {
    this.builder.groupItems('account', account => {
      const groupedItem = new PositionItem();
      (groupedItem as any).symbol = account; // for now using for grouping TODO: use another class for grouped element
      groupedItem.account = new DataCell();
      groupedItem.account.updateValue(account);
      groupedItem.account.bold = true;
      groupedItem.account.colSpan = this.columns.length - 1;

      return groupedItem;
    });
  }

  delete(item: PositionItem) {
    if (!item) {
      return;
    }

    if (item.position) {
      this.deleteItem(item.position);
    } else {
      const ids = this.items
        .filter(i => i.position && i.position.account === (item as any).symbol)
        .map(i => i.position.id);

      this.repository
        .deleteMany({ ids })
        .subscribe(
          () => this._showSuccessDelete(),
          err => this._handleDeleteError(err),
        );
    }
  }

  protected _deleteItem(item: IPosition) {
    return this.repository.deleteItem(item) ;
  }

  handleAccountChange(accountId: Id): void {
    this.accountId = accountId;
  }
}
