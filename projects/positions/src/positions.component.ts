import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import {
  convertToColumn,
  HeaderItem,
  ISettingsApplier,
  RealtimeGridComponent,
  SettingsApplier,
  ViewGroupItemsBuilder
} from 'base-components';
import { Id, IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, Column, DataGridHandler } from 'data-grid';
import { LayoutNode } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { AccountsListener, RealPositionsRepository } from 'real-trading';
import { IPresets, LayoutPresets, TemplatesService } from 'templates';
import {
  IAccount,
  IInstrument,
  InstrumentsRepository,
  IPosition,
  IPositionParams,
  Level1DataFeed,
  PositionsFeed,
  PositionsRepository,
  PositionStatus,
  TradeDataFeed,
  TradePrint
} from 'trading';
import { Components } from '../../../src/app/modules';
import { IPositionsPresets, IPositionsState } from '../models';
import { GroupedPositionItem, groupStatus } from './models/grouped-position.item';
import { PositionColumn, PositionItem } from './models/position.item';
import { defaultSettings } from './positions-settings/field.config';
import { positionsSettings } from './positions-settings/positions-settings.component';
import { IStoreItem, ItemsStore, ItemsStores } from 'items-store';
import { complexInstrumentId } from 'base-order-form';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

const profitStyles = {
  // lossBackgroundColor: '#C93B3B',
  // inProfitBackgroundColor: '#4895F5',
  lossBorderColor: '#1B1D22',
  inProfitBorderColor: '#1B1D22',
  /* hoveredlossBackgroundColor: '#C93B3B',
   hoveredinProfitBackgroundColor: '#4895F5',*/
  hoveredlossBorderColor: '#2B2D33',
  hoveredinProfitBorderColor: '#2B2D33',
  hoveredBackgroundColor: '#2B2D33',
};

const headers: HeaderItem<PositionColumn>[] = [
  { name: PositionColumn.instrumentName, title: 'SYMBOL' },
  { name: PositionColumn.exchange, title: 'EXCH' },
  PositionColumn.account,
  { name: PositionColumn.position, title: 'POS', style: profitStyles },
  { name: PositionColumn.total, title: 'PL', style: profitStyles },
  { name: PositionColumn.buyVolume, title: 'BUY QTY' },
  { name: PositionColumn.sellVolume, title: 'SELL QTY' },
  { name: PositionColumn.realized, title: 'R/PL', style: profitStyles },
  { name: PositionColumn.unrealized, title: 'F/PL', style: profitStyles },
  PositionColumn.price,
  { name: PositionColumn.close, hidden: true }
];

export interface PositionsComponent extends RealtimeGridComponent<IPosition>, ISettingsApplier, IPresets<IPositionsState> {
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
@LayoutPresets()
@AccountsListener()
@SettingsApplier()
@UntilDestroy()
export class PositionsComponent extends RealtimeGridComponent<IPosition> implements OnInit, OnDestroy, AfterViewInit {
  builder = new ViewGroupItemsBuilder<IPosition, PositionItem>();
  groupBy = GroupByItem.None;
  groupByOptions = GroupByItem;
  menuVisible = false;
  open: number;
  realized: number;
  totalPl: number;
  defaultSettings = defaultSettings;
  componentInstanceId: number;

  contextMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  handlers: DataGridHandler[] = [
    new CellClickDataGridHandler<PositionItem>({
      column: PositionColumn.close,
      handler: (data) => this.delete(data.item),
    }),
  ];

  Components = Components;
  protected _instrumentsStore: ItemsStore<IInstrument & IStoreItem>;

  private _columns: Column[] = [];
  private _status: PositionStatus = PositionStatus.Open;
  private _lastTrades: { [instrumentKey: string]: TradePrint } = {};

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
    public readonly _notifier: NotifierService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private _instrumentsRepository: InstrumentsRepository,
    private _tradeDataFeed: TradeDataFeed,
    private _levelOneDataFeed: Level1DataFeed,
    public readonly _templatesService: TemplatesService,
    public readonly _modalService: NzModalService,
    protected _itemsStores: ItemsStores,
  ) {
    super();
    this.autoLoadData = false;
    (window as any).positions = this;
    this.componentInstanceId = Date.now();
    this._instrumentsStore = _itemsStores.get('instruments');

    this.builder.setParams({
      groupBy: ['accountId', 'instrumentName'],
      order: 'desc',
      wrap: (item: IPosition) => {
        const positionItem = new PositionItem(item);
        positionItem.setInstrument(this._instrumentsStore.get(positionItem.complexInstrumentId));
        return positionItem;
      },
      unwrap: (item: PositionItem) => item.position,
    });
    this._columns = headers.map((i) => convertToColumn(i, {
      hoveredBackgroundColor: '#2B2D33',
      hoveredhighlightBackgroundColor: '#2B2D33',
      [`${groupStatus}BackgroundColor`]: '#24262C',
      titleUpperCase: true,
    }));

    this.addUnsubscribeFn(this._tradeDataFeed.on((trade: TradePrint, connectionId: Id) => {
      this._lastTrades[trade.instrument.id] = trade;
      this.builder.allItems.forEach(i => i.updateUnrealized(trade, connectionId));
      this.updatePl();
    }));

    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Positions');
  }

  ngOnInit() {
    super.ngOnInit();
    this._instrumentsStore.onChange
      .pipe(untilDestroyed(this))
      .subscribe(instruments => {
        for (const item of this.builder.allItems) {
          const instrument = instruments.get(item.complexInstrumentId);

          if (!instrument || instrument.loading) continue;

          item.setInstrument(instrument);
        }
      });
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

  handleAccountsConnect(accounts: IAccount[], allAccounts: IAccount[]) {
    if (allAccounts != null && allAccounts.length != 0)
      this.loadData({ accounts: allAccounts });
  }

  handleAccountsDisconnect(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this.builder.removeWhere(i => {
      const result = accounts.some(a => a.id === i.account.value);
      if (result)
        this._levelOneDataFeed.unsubscribe(i.position.instrument, i.position.connectionId);
      return result;
    });
    this.updatePl();
  }

  protected _handleCreateItems(items: IPosition[]) {
    super._handleCreateItems(items);

    items.forEach(item => {
      this._instrumentsStore.load(complexInstrumentId(item.instrument?.id, item.accountId));
      this._levelOneDataFeed.subscribe(item.instrument, item.connectionId);
    });
    this.updatePl();
  }

  protected _handleResponse(response: IPaginationResponse<IPosition>, params: any = {}) {
    if (Array.isArray(response?.data)) {
      response.data = response.data.filter((item, index, arr) => arr.findIndex(comparePosition(item)) === index);
    }
    response.data = response.data.map(item => this._addInstrumentName(item));

    super._handleResponse(response, params);
    this._handleCreateItems(response.data);
  }

  protected _handleUpdateItems(items: IPosition[]) {
    super._handleUpdateItems(items);
    this.builder.allItems.forEach(i => {
      const newInstrument = this._instrumentsStore.get(i.instrument?.id);
      if ((i.instrument as any)?.loading && newInstrument && !newInstrument?.loading ) {
        i.setInstrument(this._instrumentsStore.get(newInstrument.id));
      }

      i.updateUnrealized(this._lastTrades[i.position?.instrument.id], i.position?.connectionId);
    });
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
    const groupedItem = new GroupedPositionItem();
    groupedItem.instrumentName.updateValue(item);
    if (groupBy === 'instrumentName') {
      groupedItem.setInstrument(this._instrumentsStore.get(item.complexInstrumentId));
    }
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
      this._levelOneDataFeed.unsubscribe(item.instrument, item.connectionId);
    });
  }

  protected _deleteItem(item: IPosition) {
    return this.repository.deleteItem(item);
  }

  protected _handleDeleteItems(items: IPosition[]) {
    // handle by realtime
  }

  saveState() {
    return {
      ...this.dataGrid.saveState(), componentInstanceId: this.componentInstanceId, settings: this.settings
    };
  }

  loadState(state: IPositionsState): void {
    if (state && state.columns)
      this._columns = state.columns;

    if (state) {
      const { contextMenuState } = state;
      this.contextMenuState = contextMenuState;
      this.componentInstanceId = state.componentInstanceId;
    }
  }

  applySettings() {
    this._columns = this._columns.map(item => {
      item.style.color = this.settings.colors.textColor;
      const styles = getPositionStyles(item.name, this.settings);
      item.style = { ...item.style, ...styles };
      return item;
    });
    this.dataGrid.detectChanges(true);
  }

  _getSettingsKey() {
    return `positionsSettings.${this.componentInstanceId}`;
  }

  getOpenSettingsConfig() {
    return { name: positionsSettings };
  }

  getCloseSettingsConfig() {
    return { type: Components.PositionsSettings };
  }

  save(): void {
    const presets: IPositionsPresets = {
      id: this.loadedPresets?.id,
      name: this.loadedPresets?.name,
      type: Components.Positions
    };

    this.savePresets(presets);
  }
}

export function getPositionStyles(name, settings) {
  switch (name) {
    case PositionColumn.total:
      return generateProfitLossStyle(settings.colors.plDownColor, settings.colors.plUpColor, settings.colors.plTextColor);
    case PositionColumn.position: {
      return generateProfitLossStyle(settings.colors.positionShortColor,
        settings.colors.positionLongColor, settings.colors.positionTextColor);
    }
    case PositionColumn.realized: {
      return generateProfitLossStyle(settings.colors.realizedDownColor, settings.colors.realizedUpColor,
        settings.colors.realizedTextColor);
    }
    case PositionColumn.unrealized: {
      return generateProfitLossStyle(settings.colors.floatingDownColor, settings.colors.floatingUpColor,
        settings.colors.floatingTextColor);
    }
  }
}

function generateProfitLossStyle(lossBackgroundColor, inProfitBackgroundColor, color) {
  return {
    lossBackgroundColor,
    inProfitBackgroundColor,
    hoveredlossBackgroundColor: lossBackgroundColor,
    hoveredinProfitBackgroundColor: inProfitBackgroundColor,
    color
  };
}

function comparePosition(item) {
  return i => item.instrument.id === i.instrument.id && item.accountId === i.accountId;
}
