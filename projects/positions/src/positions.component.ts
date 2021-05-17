import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { convertToColumn, HeaderItem, RealtimeGridComponent, ViewGroupItemsBuilder } from 'base-components';
import { IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, Column, DataCell, DataGrid, DataGridHandler } from 'data-grid';
import { LayoutNode } from 'layout';
import { RealInstrumentsRepository, RealPositionsRepository } from 'real-trading';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AccountRepository,
  InstrumentsRepository,
  IPosition,
  IPositionParams,
  PositionsFeed,
  PositionsRepository,
  PositionStatus,
  TradeDataFeed,
  TradePrint
} from 'trading';
import { PositionColumn, PositionItem } from './models/position.item';
import { NotifierService } from 'notifier';

const profitStyles = {
  lossBackgroundColor: '#C93B3B',
  inProfitBackgroundColor: '#4895F5',
  lossBorderColor: '#101114',
  inProfitBorderColor: '#101114',
  PLHoveredBorderColor: '#2B2D33',
};

const headers: HeaderItem<PositionColumn>[] = [
  PositionColumn.account,
  PositionColumn.price,
  PositionColumn.side,
  PositionColumn.size,
  { name: PositionColumn.realized, style: profitStyles },
  { name: PositionColumn.unrealized, style: profitStyles },
  PositionColumn.total,
  { name: PositionColumn.instrumentName, title: 'instrument' },
  PositionColumn.exchange,
  { name: PositionColumn.close, hidden: true }
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
export class PositionsComponent extends RealtimeGridComponent<IPosition> implements OnInit, OnDestroy, AfterViewInit {
  builder = new ViewGroupItemsBuilder<IPosition, PositionItem>();

  private _columns: Column[] = [];
  groupBy = GroupByItem.None;
  groupByOptions = GroupByItem;
  menuVisible = false;
  open: number;
  realized: number;
  totalPl: number;
  contextMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  @ViewChild('grid') dataGrid: DataGrid;

  private _status: PositionStatus = PositionStatus.Open;

  private _accountId;

  handlers: DataGridHandler[] = [
    new CellClickDataGridHandler<PositionItem>({
      column: PositionColumn.close,
      handler: (data) => this.delete(data.item),
    }),
  ];

  get columns() {
    return this._columns;
  }

  private get positions(): IPosition[] {
    return this.items.filter(item => item.position).map(item => item.position);
  }

  get status() {
    return this._status;
  }

  get isGroupSelected() {
    return this.groupBy !== GroupByItem.None;
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

  set accountId(accountId) {
    this._accountId = accountId;
    this.loadData({ accountId });
  }

  get accountId() {
    return this._accountId;
  }

  constructor(
    protected _repository: PositionsRepository,
    protected _injector: Injector,
    protected _dataFeed: PositionsFeed,
    protected _notifier: NotifierService,
    private _accountRepository: AccountRepository,
    private _instrumentsRepository: InstrumentsRepository,
    private _tradeDataFeed: TradeDataFeed,
  ) {
    super();
    this.autoLoadData = false;
    this.subscribeToConnections = false;

    this.builder.setParams({
      groupBy: ['accountId', 'instrumentName'],
      order: 'desc',
      wrap: (item: IPosition) => new PositionItem(item),
      unwrap: (item: PositionItem) => item.position,
    });
    this._columns = headers.map((i) => convertToColumn(i, {
      hoveredBackgroundColor: '#2B2D33',
      hoveredBorderColor: '#2b2d33',
    }));

    this.addUnsubscribeFn(this._tradeDataFeed.on(async (trade: TradePrint) => {
      const instrument = await (this._instrumentsRepository as RealInstrumentsRepository).getStoredItem(trade.instrument);

      this.items.map(i => i.updateUnrealized(trade, instrument));
      this.dataGrid?.detectChanges();
      this.updatePl();
    }));

    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Positions');
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.dataGrid.applyStyles({
      columnHeaderBorderColor: '#24262C',
      gridBorderColor: 'transparent',
      gridBorderWidth: 0,
      rowHeight: 25,
    });
  }

  protected _handleCreateItems(items: IPosition[]) {
    super._handleCreateItems(items);
    this.updatePl();
  }

  protected _handleResponse(response: IPaginationResponse<IPosition>, params: any = {}) {
    super._handleResponse(response, params);
    response.data.forEach(item => this._levelOneDataFeed.subscribe(item.instrument));
  }

  protected _handleUpdateItems(items: IPosition[]) {
    super._handleUpdateItems(items);
    this.updatePl();
  }

  protected _handleConnection(connection) {
    super._handleConnection(connection);
    this._accountRepository = this._accountRepository.forConnection(connection);
    this._instrumentsRepository = this._instrumentsRepository.forConnection(connection);
    if (!connection?.connected) {
      this.accountId = null;
    } else {
      this._loadAccount();
    }
  }

  private async updatePl() {
    const instrumentsPromises = this.positions.map(position => {
      return (this._instrumentsRepository as RealInstrumentsRepository).getStoredItem(position.instrument);
    });

    const precision = await Promise.all(instrumentsPromises).then(instruments => {
      return instruments.reduce((accum, instrument) => Math.max(accum, instrument.precision), 0);
    });

    this.open = +this.builder.items.filter(item => item.position)
      .reduce((total, current) => total + (+current.unrealized.value), 0).toFixed(precision);
    this.realized = +this.positions.reduce((total, current) => total + current.realized, 0).toFixed(precision);
    this.totalPl = this.open + this.realized;
  }

  protected _transformDataFeedItem(item) {
    return this._addInstrumentName(RealPositionsRepository.transformPosition(item));
  }

  // need for group by InstrumentName
  protected _getItems(params?): Observable<IPaginationResponse<IPosition>> {
    return this.repository.getItems(params)
      .pipe(map(response => {
        response.data = response.data.map(item => {
          return this._addInstrumentName(item);
        });
        return response;
      }));
  }

  private _addInstrumentName(item) {
    return { ...item, instrumentName: item.instrument.symbol };
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

  ngOnDestroy() {
    super.ngOnDestroy();
    this.positions.forEach(item => {
      this._levelOneDataFeed.unsubscribe(item.instrument);
    });
  }

  protected _deleteItem(item: IPosition) {
    return this.repository.deleteItem(item);
  }

  protected _handleDeleteItems(items: IPosition[]) {
    // handle by realtime
  }

  saveState() {
    return { ...this.dataGrid.saveState() };
  }

  loadState(state): void {
    this._subscribeToConnections();

    if (state && state.columns)
      this._columns = state.columns;

    if (state) {
      const { contextMenuState } = state;
      this.contextMenuState = contextMenuState;
    }
  }

  private _loadAccount(): void {
    this._accountRepository.getItems({ status: 'Active', criteria: '', limit: 1 })
      .subscribe({
        next: (res) => this.accountId = res?.data?.length && res.data[0].id,
        error: err => this._notifier.showError(err, 'Failed to load account')
      });
  }
}
