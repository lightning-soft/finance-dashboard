import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from "@ngneat/until-destroy";
import { IAccountNodeData } from 'accounts-manager';
import { convertToColumn, HeaderItem, RealtimeGridComponent, ViewGroupItemsBuilder } from 'base-components';
import { IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, Column, DataCell, DataGrid, DataGridHandler } from 'data-grid';
import { LayoutNode } from 'layout';
import { NotifierService } from 'notifier';
import { RealPositionsRepository } from 'real-trading';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  IAccount,
  IConnection,

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

const profitStyles = {
  lossBackgroundColor: '#C93B3B',
  inProfitBackgroundColor: '#4895F5',
};

const headers: HeaderItem<PositionColumn>[] = [
  PositionColumn.account,
  PositionColumn.price,
  PositionColumn.side,
  PositionColumn.size,
  { name: PositionColumn.realized, style: profitStyles },
  { name: PositionColumn.unrealized, style: profitStyles },
  { name: PositionColumn.total, style: profitStyles },
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
  private _connections: IConnection[] = [];
  private _accounts: IAccount[] = [];

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
  private _lastTrades: {[instrumentKey: string]: TradePrint} = {};

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

  constructor(
    protected _repository: PositionsRepository,
    protected _injector: Injector,
    protected _dataFeed: PositionsFeed,
    protected _notifier: NotifierService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private _instrumentsRepository: InstrumentsRepository,
    private _tradeDataFeed: TradeDataFeed,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      groupBy: ['accountId', 'instrumentName'],
      order: 'desc',
      wrap: (item: IPosition) => new PositionItem(item),
      unwrap: (item: PositionItem) => item.position,
    });
    this._columns = headers.map((i) => convertToColumn(i, {
      hoveredBackgroundColor: '#2B2D33',
    }));

    this.addUnsubscribeFn(this._tradeDataFeed.on((trade: TradePrint) => {
      this._lastTrades[trade.instrument.id] = trade;
      this._instrumentsRepository.getItemById(trade.instrument.symbol, { exchange: trade.instrument.exchange })
        .pipe(untilDestroyed(this))
        .subscribe((instrument) => {
          this.items.forEach(i => i.updateUnrealized(trade, instrument));
          this.dataGrid?.detectChanges();
          this.updatePl();
        }, error => this._notifier.showError(error, 'Failed to load instrument'));
    }));

    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Positions');
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.dataGrid.applyStyles({
      gridHeaderBorderColor: '#24262C',
      gridBorderColor: 'transparent',
      gridBorderWidth: 0,
      rowHeight: 25,
    });
  }

  handleConnectedConnectionsChange(data: IAccountNodeData) {
    super.handleConnectedConnectionsChange(data);

    this._connections = data.created;
  }

  handleAccountsChange(data: IAccountNodeData<IAccount>) {
    super.handleAccountsChange(data);

    if (data.deleted.length) {
      const itemsToDelete = this.items.filter(i => data.deleted.some(_i => _i.id === i.position.accountId));

      this.builder.handleDeleteItems(itemsToDelete);
      this.updatePl();
    }

    this._accounts = data.created;

    if (this._accounts.length) {
      this.loadData();
    }
  }

  protected _getItems(params?: any): Observable<IPaginationResponse<IPosition>> {
    const observables = this._accounts.map(account => {
      const connection = this._connections.find(i => i.id === account.connectionId);

      return this.repository.get(connection).getItems({ ...params, accountId: account.id })
        .pipe(
          map((res: IPaginationResponse<IPosition>) => {
            res.data = res.data.map(item => {
              return this._addInstrumentName(item);
            });

            return res;
          }),
          mergeMap((res: IPaginationResponse<IPosition>) => {
            return this._combinePositionsWithInstruments(res.data).pipe(
              map(positions => ({ ...res, data: positions }))
            );
          }),
        );
    });

    return forkJoin(observables).pipe(
      map((responses: IPaginationResponse<IPosition>[]) => {
        return responses.reduce((accum, res) => {
          accum.data = accum.data.concat(res.data);

          return accum;
        });
      }),
    );
  }

  protected _handleCreateItems(items: IPosition[]) {
    this._combinePositionsWithInstruments(items)
      .pipe(
        untilDestroyed(this),
        catchError(error => of(items))
      )
      .subscribe((combinedPositions) => {
        super._handleCreateItems(combinedPositions);
        this.updatePl();
      });
  }

  protected _handleResponse(response: IPaginationResponse<IPosition>, params: any = {}) {
    super._handleResponse(response, params);
    response.data.forEach(item => this._levelOneDataFeed.subscribe(item.instrument));
    this.updatePl();
  }

  protected _handleUpdateItems(items: IPosition[]) {
    super._handleUpdateItems(items.map(i => {
      delete i.instrument; // instrument data from realtime is not full and correct
      return i;
    }));
    this.items.forEach(i => i.updateUnrealized(this._lastTrades[i.position?.instrument.id], i.position?.instrument));
    this.updatePl();
  }

  private updatePl(): void {
    this.open = this.builder.items.filter(item => item.position)
      .reduce((total, current) => total + (+current?.unrealized.numberValue ?? 0), 0);
    this.realized = this.positions.reduce((total, current) => total + current.realized, 0);
    this.totalPl = this.open + this.realized;
    this.detectChanges();
  }

  protected _transformDataFeedItem(item) {
    return this._addInstrumentName(RealPositionsRepository.transformPosition(item));
  }

  private _combinePositionsWithInstruments(positions: IPosition[]): Observable<IPosition[]> {
    const instrumentsRequests = positions.map(p => {
      const connection = this._connections.find(i => {
        const account = this._accounts.find(_i => _i.id === p.accountId);

        return i.id === account.connectionId;
      });

      return this._instrumentsRepository.get(connection)
        .getItemById(p.instrument.symbol, { exchange: p.instrument.exchange });
    });

    return forkJoin(instrumentsRequests).pipe(
      map(instruments => positions.map((p, index) => {
        // p.instrument = instruments[index];
        return p;
      }))
    );
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
    if (state && state.columns)
      this._columns = state.columns;

    if (state) {
      const { contextMenuState } = state;
      this.contextMenuState = contextMenuState;
    }
  }
}

