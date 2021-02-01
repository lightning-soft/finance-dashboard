import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { convertToColumn, RealtimeGridComponent, ViewGroupItemsBuilder } from 'base-components';
import { Id, IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, Column, DataCell } from 'data-grid';
import { LayoutNode } from 'layout';
import { positionsLevelOneDataFeedHandler } from 'real-trading';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPosition, IPositionParams, PositionsFeed, PositionsRepository, PositionStatus } from 'trading';
import { PositionItem } from './models/position.item';

const headers = [
  'account',
  'price',
  'size',
  'realized',
  'unrealized',
  'total',
  ['instrumentName', 'instrument'],
  'exchange',
];

export interface PositionsComponent extends RealtimeGridComponent<IPosition> {
}

enum GroupByItem {
  None = 'none',
  AccountId = 'accountId',
  InstrumentName = 'instrumentName'
}

@Component({
  selector: 'position-list',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
@LayoutNode()
export class PositionsComponent extends RealtimeGridComponent<IPosition> implements OnInit, OnDestroy {
  builder = new ViewGroupItemsBuilder();

  protected _levelOneDataFeedHandler = positionsLevelOneDataFeedHandler;

  private _columns: Column[] = [];
  groupBy = GroupByItem.None;
  groupByOptions = GroupByItem;

  get columns() {
    const closeColumn: Column = {
      name: 'close',
      visible: true,
    };

    return this.status === PositionStatus.Open ? this._columns.concat(closeColumn) : this._columns;
  }

  get positions(): IPosition[] {
    return this.items.filter(item => item.position).map(item => item.position);
  }

  get open() {
    return this.positions.reduce((total, current) => total + current.unrealized, 0);
  }

  get realized() {
    return this.positions.reduce((total, current) => total + current.realized, 0);
  }

  private _status: PositionStatus = PositionStatus.Open;

  get status() {
    return this._status;
  }
  get isGroupSelected(){
    return this.groupBy !== GroupByItem.None;
  }

  handleGroupChange($event: any) {
    if ($event === this.groupBy)
      return;
    this.groupBy = $event;
    if ($event === GroupByItem.None)
      this.builder.ungroupItems();
    else
      this.groupItems($event);
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
      groupBy: ['accountId', 'instrumentName'],
      order: 'desc',
      wrap: (item: IPosition) => new PositionItem(item),
      unwrap: (item: PositionItem) => item.position,
    });

    this._columns = headers.map(convertToColumn);

    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Positions');
  }

  // need for group by InstrumentName
  protected _getItems(params?): Observable<IPaginationResponse<IPosition>> {
    return this.repository.getItems(params)
      .pipe(map(response => {
        response.data = response.data.map(item => {
          return { ...item, instrumentName: item.instrument.symbol };
        });
        return response;
      }));
  }

  groupItems(groupBy) {
    this.builder.groupItems(groupBy, item => {
      if (groupBy === GroupByItem.AccountId) {
        return this.getGroupHeaderItem(item, 'account');
      } else {
        return this.getGroupHeaderItem(item, 'instrumentName');
      }
    });
  }

  getGroupHeaderItem(item, groupBy) {
    const groupedItem = new PositionItem();
    (groupedItem as any).symbol = item; // for now using for grouping TODO: use another class for grouped element
    groupedItem[groupBy] = new DataCell();
    groupedItem[groupBy].updateValue(item);
    groupedItem[groupBy].bold = true;
    groupedItem[groupBy].colSpan = this.columns.length - 1;
    return groupedItem;
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
