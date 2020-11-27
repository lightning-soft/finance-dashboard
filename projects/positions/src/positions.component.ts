import {
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ItemsComponent, ViewGroupItemsBuilder } from 'base-components';
import { Id, IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, Column, DataCell } from 'data-grid';
import { LayoutNode } from 'layout';

import {
  IPosition,
  IPositionParams,
  ITrade,
  LevelOneDataFeed,
  PositionsFeed,
  PositionsRepository,
  PositionStatus,
  Side
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
export class PositionsComponent extends ItemsComponent<IPosition> implements OnInit, OnDestroy {
  builder = new ViewGroupItemsBuilder();

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
    protected _datafeed: PositionsFeed,
    private _levelOneDatafeed: LevelOneDataFeed,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      groupBy: ['accountId'],
      order: 'desc',
      wrap: (item: IPosition) => new PositionItem(item),
      unwrap: (item: PositionItem) => item.position,
    });
  }

  ngOnInit() {
    this._onLevelOneDatafeed();

    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this._unsubscribeFromLevelOneDatafeed(this.items);
  }

  protected _onLevelOneDatafeed() {
    this._levelOneDatafeed.on((trade: ITrade) => {
      const { instrument } = trade;

      if (!instrument) {
        return;
      }

      const id = instrument.exchange + instrument.symbol;
      const item = this.items.find(i => i.id === id)?.position;

      if (!item) {
        return;
      }

      const price = item.size
        ? item.side === Side.Long ? trade.bidInfo.price : trade.askInfo.price
        : 0;

      const total = item.size * price;

      const _item = { ...item, price, total };

      this._handleUpdateItems([_item]);
    });
  }

  protected _subscribeToLevelOneDatafeed(items: IPosition[]) {
    items.forEach(item => {
      this._levelOneDatafeed.subscribe(item.instrument);
    });
  }

  protected _unsubscribeFromLevelOneDatafeed(items: IPosition[]) {
    items.forEach(item => {
      this._levelOneDatafeed.unsubscribe(item.instrument);
    });

    this._columns = headers.map(header => ({ name: header, visible: true }));
  }

  groupItems() {
    this.builder.groupItems('accountId', account => {
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

  protected _handleResponse(response: IPaginationResponse<IPosition>) {
    super._handleResponse(response);

    this._subscribeToLevelOneDatafeed(response?.data);
  }

  protected _handleCreateItems(items: IPosition[]) {
    super._handleCreateItems(items);

    this._subscribeToLevelOneDatafeed(items);
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
