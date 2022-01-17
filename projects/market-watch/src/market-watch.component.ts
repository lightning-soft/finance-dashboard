import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  HostBinding,
  Injector,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { convertToColumn, ItemsComponent } from 'base-components';
import { OrderColumn } from 'base-order-form';
import { Id } from 'communication';
import {
  Cell,
  CellClickDataGridHandler,
  CellStatus,
  Column,
  ContextMenuClickDataGridHandler,
  DataGrid,
  DataGridHandler,
  generateNewStatusesByPrefix
} from 'data-grid';
import { noneValue } from 'dynamic-form';
import { InstrumentDialogComponent } from 'instrument-dialog';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import * as clone from 'lodash.clonedeep';
import { NzContextMenuService, NzDropdownMenuComponent, NzModalService, NzSpinComponent } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { AccountsListener, filterByAccountsConnection, filterConnection, IConnectionsListener } from 'real-trading';
import { Subject } from 'rxjs';
import { buffer, debounceTime, skip, take } from 'rxjs/operators';
import {
  IAccount,
  IConnection,
  IInstrument,
  InstrumentsRepository,
  IOrder,
  IQuote,
  isForbiddenOrder,
  Level1DataFeed,
  OHLVData,
  OHLVFeed,
  OrderDuration,
  OrdersFeed,
  OrderSide,
  OrdersRepository,
  OrderStatus,
  OrderType,
  PositionsFeed,
  PositionsRepository,
  SettleData,
  SettleDataFeed
} from 'trading';
import { ConfirmModalComponent, CreateModalComponent, RenameModalComponent } from 'ui';
import { IWindow } from 'window-manager';
import { orderFormOptions, widgetList } from '../../../src/app/components/dashboard';
import { Components } from '../../../src/app/modules';
import { InputWrapperComponent } from './input-wrapper/input-wrapper.component';
import { MarketWatchColumns, MarketWatchColumnsArray } from './market-watch-columns.enum';
import { DisplayOrders, OpenIn } from './market-watch-settings/configs';
import {
  defaultSettings,
  marketWatchReceiveKey,
  MarketWatchSettings
} from './market-watch-settings/market-watch-settings.component';
import { MarketWatchBuilder } from './market-watch.builder';
import { defaultInstruments } from './mocked-instruments';
import { PerformedAction } from './models/actions.cell';
import { IMarketWatchItem, ItemType } from './models/interface-market-watch.item';
import { MarketWatchCreateOrderItem } from './models/market-watch-create-order.item';
import { MarketWatchLabelItem } from './models/market-watch-label.item';
import { MarketWatchItem } from './models/market-watch.item';
import { MarketWatchSubItem } from './models/market-watch.sub-item';
import { NumberWrapperComponent } from './number-wrapper/number-wrapper.component';
import { SelectWrapperComponent } from './select-wrapper/select-wrapper.component';
import { InstrumentHolder, LabelHolder, Tab } from './tab.model';
import { AccountSelectComponent } from 'account-select';
import { IMarketWatchPresets, IMarketWatchState } from '../models';
import { IPresets, LayoutPresets, TemplatesService } from 'templates';

const labelText = 'Indices';

const maxTabCount = 10;
const profitStyles = {
  color: '#fff',
  ...generateNewStatusesByPrefix({
    lossBackgroundColor: '#C93B3B',
    inProfitBackgroundColor: '#4895F5',
    lossBorderColor: '#1B1D22',
    inProfitBorderColor: '#1B1D22',
  }, CellStatus.Hovered)
};
const orderStyles = {
  ...generateNewStatusesByPrefix({
    orderSellColor: '#C93B3B',
    orderBuyColor: '#4895F5',
    orderPriceColor: '#D0D0D2',
    createOrderPriceDisabledColor: 'rgba(208,208,210,0.4)',
    labelColor: '#fff',
    createOrderColor: '#D0D0D2',
    createOrderBorderColor: '#1B1D22',
  }, CellStatus.Hovered),
  ...generateNewStatusesByPrefix({
    orderBuyBackgroundColor: '#24262C',
    orderSellBackgroundColor: '#24262C',
    orderBuyBorderColor: '#24262C',
    orderSellBorderColor: '#24262C',
    orderPriceBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    orderPriceBorderColor: '#1B1D22',
    orderPriceDisabledBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    orderPriceDisabledBorderColor: '#1B1D22',
    labelBackgroundColor: '#24262C',
  }, CellStatus.Hovered, '#383A40'),
};
const defaultStyles = {
  color: '#D0D0D2',
  hoveredColor: '#D0D0D2',
  hoveredhighlightBorderColor: '#383A40',
  highlightBorderColor: '#1B1D22',
  hoveredBackgroundColor: '#383A40',
  hoveredhighlightBackgroundColor: '#383A40',
  textAlign: 'left',
  BorderColor: '#1B1D22',
  hoveredBorderColor: '#383A40',
};

const extendedHeaderHeight = 36;
const rowHeight = 25;

const profitClass = 'inProfit';
const lossClass = 'loss';
const generalColumnStyles = 'generalStyles';

const headers = [
  { name: MarketWatchColumns.Symbol, hidden: true, visible: true },
  {
    name: MarketWatchColumns.Position, subtitle: 'ACCOUNT', style: profitStyles
  },
  { name: MarketWatchColumns.Last, subtitle: 'order Id'.toUpperCase() },
  { name: MarketWatchColumns.NetChange, title: 'NET CHG', subtitle: 'SIDE', },
  { name: MarketWatchColumns.PercentChange, title: '% CHG', subtitle: 'QTY' },
  { name: MarketWatchColumns.WorkingBuys, title: 'WRK BUYS', subtitle: 'TYPE', },
  { name: MarketWatchColumns.BidQuantity, title: 'BID QTY', subtitle: 'PRICE', },
  { name: MarketWatchColumns.Bid, subtitle: 'TRIGGER PRICE' },
  { name: MarketWatchColumns.Ask, subtitle: 'AVERAGE FILL PRICE' },
  { name: MarketWatchColumns.AskQuantity, title: 'ASK QTY', subtitle: 'TIF', },
  { name: MarketWatchColumns.WorkingSells, title: 'WRK SELLS', subtitle: 'DESTINATION', },
  { name: MarketWatchColumns.Volume, title: 'VOLUME', subtitle: 'STATUS' },
  { name: MarketWatchColumns.Settle, subtitle: '' },
  { name: MarketWatchColumns.High, subtitle: '' },
  { name: MarketWatchColumns.Low, subtitle: '' },
  { name: MarketWatchColumns.Open, subtitle: '' },
];
const marketWatchKeyLinking = 'marketwatch-linking';
const marketWatchOrderKeyLinking = 'marketWatchOrderKeyLinking';

const ordersColumns = [MarketWatchColumns.Position, MarketWatchColumns.Bid,
  MarketWatchColumns.BidQuantity, MarketWatchColumns.Ask, MarketWatchColumns.AskQuantity];

export interface MarketWatchComponent extends ILayoutNode, IPresets<IMarketWatchState> {
}

@UntilDestroy()
@Component({
  selector: 'market-watch',
  templateUrl: './market-watch.component.html',
  styleUrls: ['./market-watch.component.scss'],
})
@LayoutNode()
@LayoutPresets()
@AccountsListener()
export class MarketWatchComponent extends ItemsComponent<any> implements AfterViewInit, OnDestroy, IConnectionsListener {
  columns: Column[] = [];
  contextInstrument: IInstrument;
  lastContextMenuPoint: { x, y };
  contextLabelId: Id;
  contextPoint: { x, y };
  connection$ = new Subject<void>();

  selectFirstAsDefault = false;

  isInlineOrderCreating = false;

  menuItems = [{ title: 'Add Symbol', action: () => this.addSymbol() }, { divider: true }];

  dataFeeds = [];

  account: IAccount;

  accountId: Id;
  connection: IConnection;
  prevConnection: IConnection;
  connections: IConnection[] = [];

  accounts = [];

  currentCell: Cell;

  createdOrders = [];

  columnSettings;

  Components = Components;

  handlers: DataGridHandler[] = [
    new CellClickDataGridHandler<MarketWatchItem>({
      column: ordersColumns,
      handler: this._createOrderByClick.bind(this),
    }),
    new CellClickDataGridHandler<MarketWatchItem>({
      column: MarketWatchColumns.Symbol,
      handler: (data, event) => {
        if (data.item?.itemType !== ItemType.Item)
          return;

        if (!data.item.toggleExpand(event))
          this._sendLinks(data);

        if (!data.item?.subItems?.length || !this.settings.display.showOrders)
          return;

        if (!data.item.toggleExpand(event))
          return;
        const instrumentHolder: InstrumentHolder = this.currentTab.getInstrumentHolder(data.item.instrument);

        if (data.item.shouldExpand) {
          data.item.setShouldExpand(false);
          instrumentHolder.expanded = false;
          this.builder.removeViewModels(data.item.subItems);
        } else {
          const viewModel = data.item;
          this.addOrders(viewModel);
          viewModel.setShouldExpand(true);
          instrumentHolder.expanded = true;
        }
      },
    }),
    new CellClickDataGridHandler<MarketWatchCreateOrderItem>({
        column: MarketWatchColumns.Symbol,
        handler: (data, event) => {
          if (data?.item.itemType !== ItemType.CreateItem)
            return;

          const action = data.item.checkAction(event);
          switch (action) {
            case PerformedAction.Close:
              this.cancelCreateOrder(data.item);
              break;
            case PerformedAction.Stop:
              this.isInlineOrderCreating = false;
              break;
            case PerformedAction.Play:
              this.builder.deleteItems([data.item]);
              const order = data.item.getDto();
              this.cancelCreateOrder(data.item);
              this._ordersRepository.createItem(order).toPromise().then(orderResponse => {
                if (!isForbiddenOrder(orderResponse))
                  this.createdOrders.push(orderResponse.id);
              });
              break;
          }
        }
      }
    ),
    new CellClickDataGridHandler<MarketWatchCreateOrderItem>({
      column: MarketWatchColumnsArray,
      handler: (data, event) => {
        if (data?.item.itemType !== ItemType.CreateItem)
          return;
        const cell = data.item[data.column.name];
        if (cell && cell.editable) {
          const point = { x: event.offsetX, y: event.offsetY };
          this._dataGrid.startEditingAt(point.x, point.y);
        }
      },
    }),
    new CellClickDataGridHandler<MarketWatchSubItem>({
        column: MarketWatchColumns.Symbol,
        handler: (data, event) => {
          if (data.item.itemType !== ItemType.SubItem)
            return;

          const action = data.item.checkAction(event);
          const order = data.item?.order;
          switch (action) {
            case PerformedAction.Close:
              this._ordersRepository.deleteItem(order)
                .toPromise().then(item => this._processOrders(item));
              break;
            case PerformedAction.Play:
              this._ordersRepository.play(order).toPromise()
                .then(item => {
                  order.status = OrderStatus.Canceled;
                  this._processOrders(order);
                  this._processOrders(item);
                });
              break;
            case PerformedAction.Stop:
              this._ordersRepository.stop(order).toPromise()
                .then(item => this._processOrders(item));
              break;
          }
        }
      }
    ),
    new ContextMenuClickDataGridHandler<MarketWatchItem>({
      column: MarketWatchColumns.Symbol,
      handleHeaderClick: true,
      handler: (data, event) => {
        if (data.item?.itemType == null || data.item?.itemType === ItemType.Item) {
          this.lastContextMenuPoint = { x: event.offsetX, y: event.offsetY };
          this.nzContextMenuService.create(event, this.symbolContextMenu);
          this.contextInstrument = data.item?.instrument;
        }
      }
    }),
    new ContextMenuClickDataGridHandler<MarketWatchItem>({
      column: MarketWatchColumns.Symbol,
      handleHeaderClick: true,
      handler: (data, event) => {
        if (data.item?.itemType !== ItemType.Label)
          return;

        this.contextLabelId = data.item?.id;
        this.contextPoint = { x: event.offsetX, y: event.offsetY };
        this.nzContextMenuService.create(event, this.labelContextMenu);
      }
    }),
  ];

  components = [
    Components.Chart,
    Components.Dom,
    Components.OrderForm,
  ];

  builder = new MarketWatchBuilder();

  private get defaultColumns() {
    return headers.map((item: any) => convertToColumn(item, { ...defaultStyles, titleUpperCase: true }));
  }

  newInstrument$ = new Subject<IInstrument>();


  isLoading = false;

  componentInstanceId;

  tabs: Tab[] = [new Tab({
    name: 'Tab 1',
    columns: this.defaultColumns,
    data: defaultInstruments.map(instrument => new InstrumentHolder(instrument)),
  }),
  ];

  currentTab = this.tabs[0];

  contextTab: Tab;
  contextMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  @ViewChild('symbolMenu') symbolContextMenu: NzDropdownMenuComponent;
  @ViewChild('labelMenu') labelContextMenu: NzDropdownMenuComponent;


  @ViewChild(DataGrid)
  protected _dataGrid: DataGrid;

  widgets = widgetList.filter(item => item.hasInstrument);

  settings: MarketWatchSettings = clone(defaultSettings);
  @HostBinding('class.show-tabs')
  showTabs = true;

  gridStyles = {
    gridHeaderBorderColor: '#24262C',
    gridBorderColor: 'transparent',
    gridBorderWidth: 0,
    subtitleColor: '#51535A',
    color: '#A1A2A5',
    rowHeight,
    headerHeight: extendedHeaderHeight,
    showSubtitles: true
  };


  editComponentsFactory = ({ cell }) => {
    const type = cell.item.editType;
    switch (type) {
      case 'orderDuration': {
        return this.createSelect(cell, OrderDuration);
      }
      case 'label':
        return this.createLabel(cell);
      case 'orderSide':
        return this.createSelect(cell, OrderSide);
      case 'orderType':
        return this.createSelect(cell, OrderType);
      case 'limitPrice':
        return this.createNumber(cell, {
          placeholder: 'Limit Price',
          instrument: cell.row.instrument,
        });
      case 'stopPrice':
        return this.createNumber(cell, {
          placeholder: 'Stop Price',
          instrument: cell.row.instrument,
        });
      case 'quantity':
        return this.createNumber(cell, { placeholder: 'Quantity',  shouldOpenSelect: false, });
      case 'accounts':
        const factory = this.componentFactoryResolver.resolveComponentFactory(AccountSelectComponent);
        return {
          factory,
          params: {
            isOpened: true,
          }
        };
      case 'loading': {
        cell.item.updateValue('');
        const spinFactory = this.componentFactoryResolver.resolveComponentFactory(NzSpinComponent);
        return { factory: spinFactory };
      }
    }
  }

  private createLabel(cell) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(InputWrapperComponent);
    const value = cell.item.value;
    cell.item.updateValue('');
    return {
      factory,
      params: {
        value,
      },
      styles: {
        // minWidth: '250px',
        // marginLeft: '40px',
        marginLeft: '5px',
      }
    };
  }

  private createSelect(cell, enumOptions: any) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(SelectWrapperComponent);
    return {
      factory,
      params: {
        options: Object.values(enumOptions).map(item => ({ label: item, value: item })), value: cell.item.value,
      }
    };
  }

  private createNumber(cell, templateOptions = {}) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(NumberWrapperComponent);
    const value = cell.item._value;

    return {
      factory,
      params: {
        ...templateOptions,
        value,
      }
    };
  }

  constructor(
    protected _repository: InstrumentsRepository,
    private _levelOneDatafeed: Level1DataFeed,
    private _settleFeed: SettleDataFeed,
    private _ohlvFeed: OHLVFeed,
    private _positionsFeed: PositionsFeed,
    private _ordersFeed: OrdersFeed,
    private _ordersRepository: OrdersRepository,
    private _positionsRepository: PositionsRepository,
    protected cd: ChangeDetectorRef,
    protected _injector: Injector,
    private nzContextMenuService: NzContextMenuService,
    public _modalService: NzModalService,
    private componentFactoryResolver: ComponentFactoryResolver,
    public _notifier: NotifierService,
    protected _zone: NgZone,
    public _templatesService: TemplatesService,
  ) {
    super();
    this.autoLoadData = false;
    this.subscribeToConnections = true;

    this._changeDetectorRef = this.cd;

    this.columns = this.defaultColumns;
    this.componentInstanceId = Date.now();

    this.setTabIcon('icon-widget-market-watch');
    this.setTabTitle('MarketWatch');

    this.dataFeeds = [
      this._levelOneDatafeed,
      this._ohlvFeed,
      this._settleFeed,
    ];

    this.builder.addCallback = (item) => this.newInstrument$.next(item);
    this.builder.deleteCallback = this._unsubscribeFromRealtime.bind(this);

    this.newInstrument$.pipe(
      buffer(this.newInstrument$.pipe(debounceTime(50))),
      untilDestroyed(this))
      .subscribe((instruments: IInstrument[]) => {
        if (!instruments.length)
          return;

        instruments.forEach(item => this._subscribeForRealtime(item));
        // #TODO add filter after implementation on backend
        this.loadPositions();
        const accounts = this.accounts;
        this._ordersRepository.getItems({ accounts }).subscribe((response) => response.data.forEach(order => this._processOrders(order)));

        this.detectChanges(true);
      });

    this.addLinkObserver({
      link: this._getOrderKey(),
      handleLinkData: (order: IOrder) => {
        if (!isForbiddenOrder(order)) {
          this.createdOrders.push(order.id);
        }
      }
    });
  }

  handleConnectionsConnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this._handleConnections(connectedConnections);
  }

  handleDefaultConnectionChanged(connections: IConnection[], defaultConnection: IConnection) {
    this._handleConnections([defaultConnection]);
  }

  handleConnectionsDisconnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this._handleConnections(connectedConnections);
  }

  private _handleConnections(connectedConnections) {
    this.connections = connectedConnections;
    const connection = connectedConnections.find(item => item.isDefault && item.connected) || connectedConnections[0];
    if (this.connection?.id !== connection?.id) {
      this.prevConnection = this.connection;
      this.connection = connection;
      this.connection$.next();
    }
  }

  private cancelCreateOrder(row) {
    const item = this.builder.getInstrumentItem(row.instrument);
    item.deleteSubItem(row);
    item.setHasCreatingOrder(false);
    this.builder.deleteItems([row]);
    this.isInlineOrderCreating = false;
  }

  private loadPositions() {
    this._positionsRepository.getItems({
      connectionId: this.connection?.id,
    }).toPromise()
      .then((response) => response?.data.forEach(pos => this._processPosition(pos)));
  }

  ngAfterViewInit() {
    if (this.settings)
      this._applySettings();
  }

  handleAccountsConnect(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this.accounts = connectedAccounts;
    if (this.account)
      return;
    const account = connectedAccounts.find(item => item.id === this.accountId);
    if (account)
      this.account = account;
    else if (connectedAccounts.length) {
      this.account = connectedAccounts[0];
    }
  }

  handleAccountsDisconnect(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this.accounts = connectedAccounts;
  }

  private addOrders(viewModel: MarketWatchItem) {
    const subItems: IMarketWatchItem[] = viewModel?.subItems.filter(item => this.shouldShowAllOrders()
      || this.createdOrders.includes(item.id));
    subItems?.forEach(item => item.applySettings(this.columnSettings));
    const index = this.builder.items.findIndex(item => item.id === viewModel.id);
    this.builder.addViewItems(subItems, index + 1);
  }

  private shouldShowAllOrders() {
    return this.settings.display.displayOrders === DisplayOrders.All;
  }

  private _getLinkingKey() {
    return marketWatchKeyLinking + this.componentInstanceId;
  }

  private _getOrderKey() {
    return marketWatchOrderKeyLinking + this.componentInstanceId;
  }

  private _sendLinks(data) {
    const instrument = data.item?.instrument;
    if (instrument)
      this.broadcastData(this._getLinkingKey(), { instrument });
  }

  _createOrderByClick(data, event) {
    if (!this.settings.display.showOrders)
      return;

    if (data.item?.itemType === ItemType.Item) {
      this.layout.removeComponents(item => {
        return item.visible && item.component.orderLink;
      });
      if (this.settings.display.openIn === OpenIn.orderTicker) {
        this.openWidgetLinked({
          component: Components.OrderForm,
          options: {
            ...orderFormOptions,
            x: event.x,
            y: event.y + this.gridStyles.rowHeight,
          }
        }, { orderLink: this._getOrderKey(), instrument: data.item.instrument });
      } else {
        this.createInlineOrder(data.item.instrument);
      }
    }
  }

  addInstruments(instruments: IInstrument | IInstrument[], index = 0) {
    if (!Array.isArray(instruments))
      instruments = [instruments];

    instruments = instruments.filter(item => !this.currentTab.hasInstrument(item));

    if (instruments.length < 1)
      return;

    this.currentTab.addInstruments(instruments, index);
    this.builder.loadInstruments(instruments);
    const viewModels = this.builder.getInstrumentsItems(instruments);
    this.builder.addViewItems(viewModels, index);
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent, tab: Tab): void {
    this.nzContextMenuService.create($event, menu);
    this.contextTab = tab;
    this.selectTab(tab);
  }

  delete(item: MarketWatchItem) {
    this.builder.deleteItems([item]);
  }

  subscribeForAllInstruments() {
    if (this.connection)
      this.getAllInstruments().forEach(item => this._subscribeForRealtime(item));
  }

  unsubscribeFromAllInstruments() {
    this.getAllInstruments().forEach(item => this._unsubscribeFromRealtime(item, this.prevConnection));
  }

  private _subscribeForRealtime(instrument: IInstrument) {
    this.dataFeeds.forEach(item => item.subscribe(instrument, this.connection.id));
  }

  private _unsubscribeFromRealtime(instrument: IInstrument, connection = this.connection) {
    if (connection.id)
      this.dataFeeds.forEach(item => item.unsubscribe(instrument, connection.id));
  }

  _handleOHLV(ohlv: OHLVData) {
    const item = this.builder.getInstrumentItem(ohlv.instrument);
    if (!item)
      return;

    item.handleOHLV(ohlv);
  }

  _processOrders(order) {
    const item = this.builder.getInstrumentItem(order?.instrument);

    if (!item)
      return;

    if (isForbiddenOrder(order))
      this.createdOrders = this.createdOrders.filter(orderId => orderId !== order.id);

    const hasOrder = item.hasOrder(order);
    item.handleOrder(order);
    if (isForbiddenOrder(order)) {
      this.builder.handleDeleteItems([order]);
    } else if (!hasOrder && item.shouldExpand && this.settings.display.showOrders) {
      this.addOrders(item);
    }
    this._changeDetectorRef.detectChanges();
  }

  _processPosition(pos) {
    const item = this.builder.getInstrumentItem(pos.instrument);

    if (!item)
      return;

    item.handlePosition(pos);
  }

  _processQuotes(quote: IQuote) {
    const item = this.builder.getInstrumentItem(quote.instrument);

    if (!item)
      return;

    item.processQuote(quote);
    this.detectChanges();
  }

  private _handleResize() {
    this._dataGrid?.resize();
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Close:
      case LayoutNodeEvent.Destroy:
      case LayoutNodeEvent.Hide:
        this._closeSettings();
        break;
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this._handleResize();
        return true;
    }

    return false;
  }

  private _closeSettings() {
    this.layout.removeComponents((item) => {
      const isSettingsComponent = Components.MarketWatchSettings === item.type;
      return item.visible && isSettingsComponent && (item.options.componentState()?.state?.linkKey === this._getSettingsKey());
    });
  }

  saveState() {
    const currentTab = this.currentTab;
    if (currentTab) {
      currentTab.columns = this._dataGrid.saveState().columns;
    }

    return {
      tabs: this.tabs,
      currentTabId: this.currentTab?.id,
      componentInstanceId: this.componentInstanceId,
      settings: this.settings,
      createdOrders: this.createdOrders,
      contextMenuState: this.contextMenuState,
      accountId: this.accountId,
    };
  }

  loadState(state?: IMarketWatchState): void {

    if (!state)
      state = {} as any;

    if (state.tabs) {
      this.tabs = state.tabs.map(item => new Tab(item));
    }
    if (state.currentTabId) {
      this.currentTab = this.tabs.find(item => item.id === state.currentTabId);
      this.columns = this.tabs.find(item => item.id === this.currentTab.id)?.columns;
    }

    this.loadInstrumentData();

    if (state.contextMenuState) {
      this.contextMenuState = state.contextMenuState;
    }
    if (state.createdOrders) {
      this.createdOrders = state.createdOrders;
    }
    if (state.settings) {
      this.settings = state.settings;
    }

    if (state.componentInstanceId) {
      this.componentInstanceId = state.componentInstanceId;
    }
    this.addLinkObserver({
      link: this._getSettingsKey(),
      handleLinkData: this._linkSettings,
    });
  }

  private loadInstrumentData() {
    this.connection$
      .pipe(
        take(1),
        untilDestroyed(this)
      ).subscribe(() => {
      const instruments = this.getAllInstruments();
      this.builder.loadInstruments(instruments);
      this.updateDataGridItems();

      this.onRemove(
        this._levelOneDatafeed.on(filterConnection(this, (updates) => this._processQuotes(updates))),
        this._positionsFeed.on(filterConnection(this, position => this._processPosition(position))),
        this._ordersFeed.on(filterByAccountsConnection(this, order => this._processOrders(order))),
        this._settleFeed.on(filterConnection(this, (settle: SettleData) => {
          const item = this.builder.getInstrumentItem(settle.instrument);
          if (item)
            item.handleSettlePrice(settle.price);
        })),
        this._ohlvFeed.on(filterConnection(this, ohlv => this._handleOHLV(ohlv))),
      );
    });
    this.connection$
      .pipe(
        skip(1),
        untilDestroyed(this)
      ).subscribe(() => {
      this.builder.clearRealtimeData();
      this.loadPositions();
      this.unsubscribeFromAllInstruments();
      this.subscribeForAllInstruments();
      this._dataGrid.detectChanges(true);
    });
  }

  private getAllInstruments() {
    return this.tabs.reduce((total, item) => {
      return total.concat(item.getInstruments());
    }, []);
  }

  _applySettings() {
    const fontWeight = this.settings.display.boldFont ? 700 : 200;

    const showOrders = this.settings.display.showOrders;
    this._dataGrid.applyStyles({
      font: `${ fontWeight } 14px \"Open Sans\", sans-serif`,
      headerHeight: (showOrders ? extendedHeaderHeight : rowHeight)
    });

    const marketWatchItems = this.builder.getMarketWatchItems();
    marketWatchItems.forEach(item => item.setShowDrawings(showOrders));

    if (!showOrders) {
      this.builder.hideSubItems();
    } else if (!this.shouldShowAllOrders()) {
      this.builder.filterSubItems(item => this.createdOrders.includes(item.id));
      marketWatchItems.forEach(item => {
        const shouldExpand = (item.subItems as MarketWatchSubItem[])
          .some(subItem => this.createdOrders.includes(subItem.order?.id));
        item.setShowDrawings(shouldExpand);
      });
    } else {
      this.showSubItems();
    }

    const styles = generateStyles(this.settings);

    this.columns.forEach((item) => {
      const style = styles[item.name];
      if (style)
        item.style = { ...defaultStyles,  ...item.style, ...style, ...orderStyles };
      else {
        item.style = { ...defaultStyles, ...item.style, ...styles[generalColumnStyles], ...orderStyles };
      }

      const column = this.settings.columnView.columns[item.name];
      item.visible = column?.enabled;
      item.disabled = this.settings.display.showOrders && column?.pair !== noneValue;
      const pair = column?.pair;
      if (showOrders)
        item.subtitle = pair === noneValue ? '' : (subtitleMap[pair] ?? pair?.toUpperCase());
      else
        item.subtitle = null;
    });

    this.columnSettings = MarketWatchColumnsArray.reduce((total: any, item) => {
      total[item] = this.settings.columnView.columns[item]?.pair;
      return total;
    }, {});


    this.showTabs = this.settings.display.showTabs;
    this.builder.items.forEach(item => item.applySettings(this.columnSettings));
    this._dataGrid?.detectChanges(true);
  }

  private _linkSettings = (res) => {
    this.settings = res;
    this._applySettings();
  }

  selectTab(tab: Tab) {
    const prevTab = this.currentTab;
    if (tab.id !== this.currentTab?.id) {
      this.currentTab = tab;

      if (prevTab)
        prevTab.columns = this._dataGrid.saveState().columns;

      this.columns = tab.columns;
      this._dataGrid.changeColumns(tab.columns);
      this.updateDataGridItems(this.settings.display.showOrders);
      this._applySettings();
      this._dataGrid?.resize();
    }
  }

  showSubItems() {
    const data = this.currentTab?.getInstrumentHolders();
    data?.forEach(item => {
      const viewItem = this.builder.getInstrumentItem(item.instrument);
      if (!viewItem)
        return;
      viewItem.shouldExpand = item.expanded;
      viewItem.updateExpanded();
      if (viewItem.shouldExpand)
        this.addOrders(viewItem);
    });
  }

  private updateDataGridItems(showSubitems = false) {
    this.isInlineOrderCreating = false;
    this.builder.displayItems(this.currentTab.data);
    if (showSubitems) {
      this.showSubItems();
    }
  }

  createTab() {
    const modal = this._modalService.create({
      nzContent: CreateModalComponent,
      nzWidth: 438,
      nzComponentParams: {
        name: 'Tab name',
        options: this.tabs.map(item => ({ label: item.name, value: item.id }))
      }
    });

    modal.afterClose
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (!result || !result.name)
          return;

        const tab = new Tab({ name: result.name, columns: this.defaultColumns });
        this.addTab(tab);
        if (this.tabs.length === 1) {
          this.selectTab(this.tabs[0]);
        }
      });
  }


  copyTab(tab: Tab) {
    if (this.tabs.length >= maxTabCount) {
      this._notifier.showError('You can\'t create more than 10 tabs');
      return;
    }
    const newTab = tab.clone();
    const index = this.tabs.indexOf(tab);
    this.addTab(newTab, index);
    this.builder.loadInstruments(newTab.getInstruments());
  }

  addTab(tab: Tab, index = this.tabs.length) {
    if (this.tabs.length >= maxTabCount) {
      this._notifier.showError('You can\'t create more than 10 tabs');
      return;
    }

    this.tabs.splice(index, 0, tab);

    if (this.tabs.length === 1)
      this.selectTab(this.tabs[0]);
  }

  renameTab() {
    const modal = this._modalService.create({
      nzTitle: 'Rename Tab',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        name: this.contextTab.name,
        label: 'Tab name',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result !== '')
        this.contextTab.name = result;
    });
  }

  deleteTab() {
    const modal = this._modalService.create({
      nzTitle: 'Delete tab',
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the tab?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed) {
        this.tabs = this.tabs.filter(item => item.id !== this.contextTab.id);
        this.builder.deleteInstruments(this.contextTab.getInstruments());

        if (this.currentTab.id === this.contextTab.id && this.tabs.length) {
          this.selectTab(this.tabs[0]);
        }

        if (this.tabs.length === 0) {
          const tab = new Tab({ name: 'Blank', columns: this.defaultColumns });
          this.tabs.push(tab);
          this.selectTab(tab);
          this.builder.replaceViewItems([]);
        }
      }
    });
  }

  openSettings($event) {
    const widget = this.layout.findComponent((item: IWindow) => {
      return item?.options.componentState()?.state?.linkKey === this._getSettingsKey();
    });
    if (widget)
      widget.focus();
    else {
      const coords: any = {};
      if ($event) {
        coords.x = $event.clientX;
        coords.y = $event.clientY;
      }
      this.layout.addComponent({
        component: {
          name: MarketWatchSettings,
          state: { linkKey: this._getSettingsKey(), settings: this.settings }
        },
        closeBtn: true,
        single: false,
        width: 558,
        height: 475,
        allowPopup: false,
        closableIfPopup: true,
        resizable: false,
        removeIfExists: false,
        minimizable: false,
        maximizable: false,
        ...coords,
      });
    }
  }

  private _getSettingsKey() {
    return `${ this.componentInstanceId }.${ MarketWatchSettings }`;
  }

  openWidget(item, $event?) {
    const coords = getCoord($event);
    this.layout.addComponent({
      component: {
        name: item.component,
        state: { instrument: this.contextInstrument },
      },
      ...item.options,
      ...coords
    });
  }

  createInstrumentModal() {
    return this._modalService.create({
      nzContent: InstrumentDialogComponent,
      nzWidth: 386,
      nzClassName: 'instrument-dialog',
      nzFooter: null,
      nzComponentParams: {
        // accountId: this.account?.id,
        connectionId: this.connection.id,
      }
    });
  }

  addSymbolBelow() {
    if (!this.contextInstrument) {
      this.addSymbol();
      return;
    }

    const index = this.builder.items.findIndex(item => item.id === this.contextInstrument?.id);
    const viewModel = this.builder.getInstrumentItem(this.contextInstrument);
    const subItemCount = viewModel?.shouldExpand ? viewModel.subItems.length : 0;
    if (index !== -1)
      this.addSymbol(index + 1 + subItemCount);
  }

  addLabel() {
    if (!this.contextInstrument) {
      return;
    }
    const index = this.builder.items.findIndex(item => item.id === this.contextInstrument?.id);
    const tabIndex = this.currentTab.data.findIndex(item => item.id === this.contextInstrument.id);
    if (tabIndex === -1 || index === -1) {
      return;
    }
    const viewModel = this.builder.getInstrumentItem(this.contextInstrument);
    const labelHolder = new LabelHolder(labelText);
    this.currentTab.data.splice(tabIndex + 1, 0, labelHolder);

    const labelViewModel = new MarketWatchLabelItem(labelHolder);
    const additionalNumber = viewModel.shouldExpand && this.settings.display.showOrders ? viewModel.subItems.length : 0;
    this.builder.addViewItems([labelViewModel], index + 1 + additionalNumber);

  }

  addSymbol(index = 0) {
    const modal = this.createInstrumentModal();
    modal.afterClose
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res) {
          this.addInstruments(res, index);
        }
      });
  }

  deleteInstrument() {
    this.builder.removeViewModel(this.builder.getInstrumentItem(this.contextInstrument));
    this.currentTab.deleteInstrument(this.contextInstrument);
    this.builder.deleteSubItems(this.contextInstrument);
    this.builder.deleteItem(this.contextInstrument);
  }


  handleAccountChange($event: any) {
    this.account = $event;
    if ($event) {
      this.broadcastData(this._getLinkingKey(), { account: $event });
    }
  }

  onColumnUpdate(column: Column) {
    const hasCommonSettings = this.settings.columnView.columns.hasOwnProperty(column.name);
    if (hasCommonSettings) {
      this.settings.columnView.columns[column.name].enabled = column.visible;
    }
    this.broadcastData(marketWatchReceiveKey + this._getSettingsKey(), this.settings);
  }

  openWidgetLinked(item, state = {}, event?) {
    const coords = getCoord(event);
    this.layout.addComponent({
      component: {
        name: item.component,
        state: {
          instrument: this.contextInstrument,
          link: this._getLinkingKey(),
          ...state,
        },
      },
      ...item.options,
      ...coords,
    });
  }

  changeInstrument() {
    const modal = this.createInstrumentModal();
    modal.afterClose
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (!res || this.contextInstrument?.id === res.id)
          return;

        this.onInstrumentChanged(this.contextInstrument, res);
      });
  }

  copyToNewTab() {
    this._copyToNewTab();
    this.builder.loadInstrument(this.contextInstrument);
  }

  private _copyToNewTab() {
    const newTab = new Tab({
      name: `Tab ${ this.tabs.length + 1 }`,
      columns: this.defaultColumns,
      data: [new InstrumentHolder(this.contextInstrument)],
    });
    this.tabs.push(newTab);
  }

  moveToNewTab() {
    if (this.tabs.length >= maxTabCount) {
      this._notifier.showError('You can\'t create more than 10 tabs');
      return;
    }
    this._copyToNewTab();
    const item = this.builder.getInstrumentItem(this.contextInstrument);
    this.builder.deleteItems(item.subItems);
    this.currentTab.deleteInstrument(this.contextInstrument);
    this.builder.removeViewModel(this.builder.getInstrumentItem(this.contextInstrument));
  }

  onInstrumentChanged(prevInstrument: IInstrument, instrument: IInstrument) {
    if (prevInstrument.id === instrument.id) {
      return;
    }

    if (this.currentTab.hasInstrument(instrument)) {
      this._notifier.showError('You can\'t add symbol that is already in the tab');
      return;
    }

    this.currentTab.changeInstrument(prevInstrument, instrument);
    this.builder.loadInstrument(instrument);
    this.builder.replaceViewItem(this.builder.getInstrumentItem(instrument), this.builder.getInstrumentItem(prevInstrument));
    this.builder.deleteItem(prevInstrument);
    this.updateDataGridItems(true);
  }

  ngOnDestroy() {
    this.builder.destroy();
  }

  private createInlineOrder(instrument: IInstrument) {
    const index = this.builder.getIndex(instrument.id);
    if (index === -1)
      return;

    const createOrderItem = this.builder.getCreateOrderItem();
    if (createOrderItem)
      this.cancelCreateOrder(createOrderItem);

    const orderMarketWatchItem = new MarketWatchCreateOrderItem(instrument, this.settings.order);
    const accountId = this.accounts.length ? this.accounts[0].id : null;

    if (accountId)
      orderMarketWatchItem.accountId.updateValue(accountId);
    orderMarketWatchItem.applySettings(this.columnSettings);
    const item = this.builder.getInstrumentItem(instrument);

    if (item.ask._value != null)
      orderMarketWatchItem.triggerPrice.updateValue(item.ask._value);
    if (item.bid._value != null)
      orderMarketWatchItem.price.updateValue(item.bid._value);

    item.subItems.unshift(orderMarketWatchItem);
    item.setHasCreatingOrder(true);
    item.setShouldExpand(true);
    if (this.settings.display.showOrders && item.subItems.length)
      this.addOrders(item);
    this.isInlineOrderCreating = true;
    this.builder.addViewItems([orderMarketWatchItem], this.builder.getIndex(instrument.id) + 1);
  }

  renameLabel() {
    this._dataGrid.startEditingAt(this.contextPoint.x, this.contextPoint.y);
  }

  deleteLabel() {
    this.currentTab.removeHolder(this.contextLabelId);
    this.builder.deleteById(this.contextLabelId);
  }

  editFinished($event: any) {
    switch ($event.row.itemType) {
      case ItemType.Label: {
        const labelHolder = this.currentTab.getLabelHolder($event.row.id);
        labelHolder.label = $event.item.value;
      }
    }
  }

  rollSymbol() {
    if (this.connection) {
      this._dataGrid.startEditingAt(this.lastContextMenuPoint.x, this.lastContextMenuPoint.y);
      this._repository.rollInstrument(this.contextInstrument, { connectionId: this.connection.id })
        .toPromise().then(instrument => {
        this.onInstrumentChanged(this.contextInstrument, instrument);
        this._dataGrid.endEdit();
      }).catch(() => {
        this._dataGrid.currentCell.updateValue(this._dataGrid.currentCell._value);
        this._dataGrid.endEdit();
      });
    }
  }

  save(): void {
    const presets: IMarketWatchPresets = {
      id: this.loadedPresets?.id,
      name: this.loadedPresets?.name,
      type: Components.MarketWatch
    };

    this.savePresets(presets);
  }
}

function generateStyles(settings: MarketWatchSettings) {
  const bid = generateStyle('bid', settings);
  const ask = generateStyle('ask', settings);
  const positionStyle = {
    ...generateNewStatusesByPrefix({
      [`${ profitClass }BackgroundColor`]: settings.colors.positionUpColor,
      [`${ lossClass }BackgroundColor`]: settings.colors.positionDownColor,
    }, CellStatus.Hovered),
    color: settings.colors.positionTextColor,
  };
  const bidQuantityStyle = {
    color: settings.colors.bidQuantityColor,
  };
  const askQuantityStyle = {
    color: settings.colors.askQuantityColor,
  };

  const netChangeStyle = {
    ...generateNewStatusesByPrefix({
      [`${ profitClass }Color`]: settings.colors.netChangeUpColor,
      [`${ lossClass }Color`]: settings.colors.netChangeDownColor,
    }, CellStatus.Hovered),
    [`hovered${ profitClass }BackgroundColor`]: '#383A40',
    [`hovered${ lossClass }BackgroundColor`]: '#383A40',
    [`hovered${ profitClass }BorderColor`]: '#383A40',
    [`hovered${ lossClass }BorderColor`]: '#383A40',
    [`${ profitClass }BorderColor`]: '#1B1D22',
    [`${ lossClass }BorderColor`]: '#1B1D22',
  };
  const percentChangeStyle = {
    ...generateNewStatusesByPrefix({
      [`${ profitClass }Color`]: settings.colors.percentChangeUpColor,
      [`${ lossClass }Color`]: settings.colors.percentChangeDownColor,
      [`hovered${ profitClass }BackgroundColor`]: '#383A40',
      [`hovered${ lossClass }BackgroundColor`]: '#383A40',
    }, CellStatus.Hovered),
    [`hovered${ profitClass }BorderColor`]: '#383A40',
    [`hovered${ lossClass }BorderColor`]: '#383A40',
    [`${ profitClass }BorderColor`]: '#1B1D22',
    [`${ lossClass }BorderColor`]: '#1B1D22',
  };

  const generalStyles = {
    color: settings.colors.textColor,
  };

  let lastStyles = {};
  if (settings.display.highlightType !== noneValue) {
    lastStyles = {
      ...generateNewStatusesByPrefix({
        highlightColor: '#fff',
        [`highlight${ settings.display.highlightType }`]: settings.colors.priceUpdateHighlight,
      }, CellStatus.Hovered)
    };
  }

  return {
    [MarketWatchColumns.Bid]: bid,
    [MarketWatchColumns.Ask]: ask,
    [MarketWatchColumns.BidQuantity]: bidQuantityStyle,
    [MarketWatchColumns.AskQuantity]: askQuantityStyle,
    [MarketWatchColumns.Position]: positionStyle,
    [MarketWatchColumns.NetChange]: netChangeStyle,
    [MarketWatchColumns.Last]: lastStyles,
    [MarketWatchColumns.PercentChange]: percentChangeStyle,
    [generalColumnStyles]: generalStyles
  };
}

const subtitleMap = {
  [OrderColumn.identifier]: 'ORDER ID',
  [OrderColumn.averageFillPrice]: 'AVERAGE FILL PRICE',
  [OrderColumn.triggerPrice]: 'TRIGGER PRICE',
  // [OrderColumn.description]: 'DESTINATION',
  [OrderColumn.description]: 'DESCRIPTION',
  [OrderColumn.accountId]: 'ACCOUNT',
  [OrderColumn.duration]: 'TIF',
};

function generateStyle(prefix, settings) {
  return {
    ...generateNewStatusesByPrefix({
      highlightColor: settings.colors[`${ prefix }Color`],
      highlightBackgroundColor: settings.colors[`${ prefix }Background`],
    }, CellStatus.Hovered)
  };
}

function getCoord(event?) {
  if (!event)
    return {};
  return { x: event.clientX, y: event.clientY };
}
