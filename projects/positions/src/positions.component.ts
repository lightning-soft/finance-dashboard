import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { RealtimeItemsComponent, ViewGroupItemsBuilder } from 'base-components';
import { Id } from 'communication';
import { CellClickDataGridHandler, Column, DataCell } from 'data-grid';
import { ILayoutNode, LayoutNode } from 'layout';
import { positionsLevelOneDataFeedHandler } from 'real-trading';
import { IPosition, IPositionParams, PositionsFeed, PositionsRepository, PositionStatus } from 'trading';
import { PositionItem } from './models/position.item';


const headers = [
  'account',
  'price',
  'size',
  'realized',
  'unrealized',
  'total',
];

export interface PositionsComponent extends ILayoutNode {
}

@Component({
  selector: 'position-list',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
@LayoutNode()
export class PositionsComponent extends RealtimeItemsComponent<IPosition> implements OnInit, OnDestroy {
  builder = new ViewGroupItemsBuilder();

  protected _levelOneDataFeedHandler = positionsLevelOneDataFeedHandler;

  public _columns: Column[] = [];



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
    protected _dataFeed: PositionsFeed,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      groupBy: ['accountId'],
      order: 'desc',
      wrap: (item: IPosition) => new PositionItem(item),
      unwrap: (item: PositionItem) => item.position,
    });

    this._columns = headers.map(header => ({ name: header, visible: true }));

    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Positions');
  }

  getColumns() {
    const closeColumn: Column = {
      name: 'close',
      visible: true,
    };
    return this.status === PositionStatus.Open ? this._columns.concat(closeColumn) : this._columns;
  }

  groupItems() {
    this.builder.groupItems('accountId', account => {
      const groupedItem = new PositionItem();
      (groupedItem as any).symbol = account; // for now using for grouping TODO: use another class for grouped element
      groupedItem.account = new DataCell();
      groupedItem.account.updateValue(account);
      groupedItem.account.bold = true;
      groupedItem.account.colSpan = this.getColumns().length - 1;

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
    return this.repository.deleteItem(item);
  }

  handleAccountChange(accountId: Id): void {
    this.accountId = accountId;
  }

  protected _handleDeleteItems(items: IPosition[]) {
    // handle by realtime
  }

  saveState() {
    return { columns: this._columns };
  }

  loadState(state): void {
    this._subscribeToConnections();

    if (state && state.columns)
      this._columns = state.columns;
  }
}
