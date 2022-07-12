import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountSelectComponent } from 'account-select';
import { BindUnsubscribe, convertToColumn, HeaderItem, IUnsubscribe, LoadingComponent } from 'base-components';
import { ConfirmOrderComponent, FormActions, OcoStep, SideOrderFormComponent } from 'base-order-form';
import { Id, RepositoryActionData } from 'communication';
import {
  capitalizeFirstLetter,
  Cell,
  CellClickDataGridHandler,
  CellStatus,
  Column,
  ContextMenuClickDataGridHandler,
  DataGrid,
  DataGridHandler,
  ICellChangedEvent,
  IFormatter,
  InstrumentFormatter,
  MouseDownDataGridHandler,
  MouseUpDataGridHandler,
} from 'data-grid';
import { environment } from 'environment';
import { InstrumentSelectComponent } from 'instrument-select';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import {
  AccountsListener,
  filterByAccountAndInstrument,
  filterByConnectionAndInstrument,
  filterPositions,
  IHistoryItem,
  RealPositionsRepository
} from 'real-trading';
import { finalize } from 'rxjs/operators';
import { TradeHandler } from 'src/app/components';
import { Components } from 'src/app/modules';
import { IPresets, LayoutPresets, TemplatesService } from 'templates';
import {
  compareInstruments,
  getPrice,
  getPriceSpecs,
  HistoryRepository,
  IAccount,
  IInstrument,
  IOrder,
  IPosition,
  IQuote,
  isForbiddenOrder,
  Level1DataFeed,
  OHLVFeed,
  OrderBooksRepository,
  OrdersFeed,
  OrderSide,
  OrdersRepository,
  OrderStatus,
  OrderType,
  PositionsFeed,
  PositionsRepository,
  QuoteSide,
  roundToTickSize,
  Side,
  TradeDataFeed,
  TradePrint,
  UpdateType,
  VolumeHistoryRepository
} from 'trading';
import { IWindow, WindowManagerService } from 'window-manager';
import { IDomPresets, IDomState } from '../models';
import { DomSettingsSelector, IDomSettingsEvent, receiveSettingsKey } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { SettingTab } from './dom-settings/settings-fields';
import { CustomDomItem, DOMColumns, DomItem, LEVELS, TailInside, VolumeStatus } from './dom.item';
import { OpenPositionStatus, openPositionSuffix } from './price.cell';
import { VolumeCell } from './histogram';
import { DailyInfoComponent } from './daily-info/daily-info.component';
import { SideOrderSettingsDom } from './interface/dom-settings.interface';

export interface DomComponent extends ILayoutNode, LoadingComponent<any, any>, IUnsubscribe, IPresets<IDomState> {
}
export class DomItemMax {
  ask: number;
  bid: number;
  // askDelta: number;
  // bidDelta: number;
  volume: number;
  totalAsk: number;
  totalBid: number;
  // currentAsk: number;
  // currentBid: number;

  // handleChanges(change): any {
  // let result;
  // if (!change)
  // return;

  // for (const key in change) {
  // if (change[key] == null || this[key] >= change[key])
  // continue;

  // if (result == null)
  // result = {};

  // this[key] = change[key];
  // result[key] = change[key];
  // }
  // return result;
  // }

  constructor() {
    this.clear();
  }

  clear() {
    this.ask = -Infinity;
    this.bid = -Infinity;
    this.volume = null;
    this.totalAsk = null;
    this.totalBid = null;
    // this.currentAsk = null;
    // this.currentBid = null;
    // this.askDelta = -Infinity;
    // this.bidDelta = -Infinity;
  }

  clearTotal() {
    this.totalAsk = null;
    this.totalBid = null;
  }
}

const ROWS = 800;
const DOM_HOTKEYS = 'domHotkeys';

enum FormDirection {
  Left = 'window-left',
  Right = 'window-right',
  Top = 'full-screen-window'
}

const directionsHints: { [key in FormDirection]: string } = {
  [FormDirection.Left]: 'Left View',
  [FormDirection.Top]: 'Horizontal View',
  [FormDirection.Right]: 'Right View',
};

const headers: HeaderItem[] = [
  {name: DOMColumns.Orders, tableViewName: 'Orders'},
  {name: DOMColumns.BuyOrders, title: 'buy Orders', tableViewName: 'Buy Orders'},
  {name: DOMColumns.SellOrders, title: 'sell Orders', tableViewName: 'Sell Orders'},
  {name: DOMColumns.Volume, tableViewName: 'Volume', type: 'histogram', width: 90},
  {name: DOMColumns.Price, tableViewName: 'Price', width: 62},
  {name: DOMColumns.Delta, tableViewName: 'Delta', width: 58},
  {name: DOMColumns.BidDelta, title: 'delta', tableViewName: 'Bid Delta', width: 68},
  {name: DOMColumns.Bid, tableViewName: 'Bid', type: 'histogram', width: 88},
  {name: DOMColumns.LTQ, tableViewName: 'LTQ', width: 49},
  {name: DOMColumns.CurrentBid, title: 'c.bid', tableViewName: 'C.Bid', type: 'histogram', width: 50},
  {name: DOMColumns.CurrentAsk, title: 'c.ask', tableViewName: 'C.Ask', type: 'histogram', width: 50},
  {name: DOMColumns.Ask, title: 'ask', tableViewName: 'Ask', type: 'histogram', width: 88},
  {name: DOMColumns.AskDelta, title: 'delta', tableViewName: 'Ask Delta', width: 68},
  {name: DOMColumns.TotalBid, title: 't.bid', tableViewName: 'T.Bid', type: 'histogram'},
  {name: DOMColumns.TotalAsk, title: 't.ask', tableViewName: 'T.Ask', type: 'histogram'},
];

export enum QuantityPositions {
  FIRST = 0,
  SECOND = 2,
  THIRD = 3,
  FORTH = 4,
  FIFTH = 5,
}

const confirmModalWidth = 376;
const confirmModalHeight = 180;

const OrderColumns: string[] = [DOMColumns.AskDelta, DOMColumns.BidDelta, DOMColumns.Orders, DOMColumns.Delta, DOMColumns.BuyOrders, DOMColumns.SellOrders];

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
  styleUrls: ['./dom.component.scss'],
})
@LayoutPresets()
@LayoutNode()
@AccountsListener()
@BindUnsubscribe()
export class DomComponent extends LoadingComponent<any, any> implements OnInit, AfterViewInit, IStateProvider<IDomState>, OnDestroy {

  get accountId() {
    return this.account?.id;
  }

  private _needCentralize = false;

  public get instrument(): IInstrument {
    return this._instrument;
  }

  public set instrument(value: IInstrument) {
    if (compareInstruments(this._instrument, value))
      return;

    const prevInstrument = this._instrument;
    this._instrument = value;
    this._needCentralize = true;
    this._onInstrumentChange(prevInstrument);
  }

  get isFormOnTop() {
    return this.currentDirection === FormDirection.Top;
  }

  @HostBinding('class.hide-header-panel')
  get showHeaderPanel() {
    return !this.dataGridMenuState?.showHeaderPanel;
  }

  get items(): DomItem[] {
    return this.dataGrid.items ?? [];
  }

  set items(value) {
    this.dataGrid.items = value;
  }

  private get _lastPrice(): number {
    return this._lastTradeItem?.lastPrice;
  }

  get trade() {
    return this._lastTrade;
  }

  get showOrderConfirm() {
    return this.domFormSettings.showOrderConfirm;
  }

  set showOrderConfirm(value) {
    this.domFormSettings.showOrderConfirm = value;
    this.broadcastData(receiveSettingsKey + this._getSettingsKey(), this._settings);
  }

  get showCancelConfirm() {
    return this.domFormSettings.showCancelConfirm;
  }

  set showCancelConfirm(value) {
    this.domFormSettings.showCancelConfirm = value;
    this.broadcastData(receiveSettingsKey + this._getSettingsKey(), this._settings);
  }

  get domFormSettings() {
    return mapSettingsToSideFormState(this._settings).formSettings;
  }

  get _tickSize() {
    return this.instrument?.tickSize ?? 0.25;
  }

  eth;
  rth;

  Components = Components;

  constructor(
    private _ordersRepository: OrdersRepository,
    private _positionsRepository: PositionsRepository,
    private _orderBooksRepository: OrderBooksRepository,
    private _ordersFeed: OrdersFeed,
    private _positionsFeed: PositionsFeed,
    private _levelOneDatafeed: Level1DataFeed,
    private _tradeDatafeed: TradeDataFeed,
    private _volumeHistoryRepository: VolumeHistoryRepository,
    private _historyRepository: HistoryRepository,
    protected _injector: Injector,
    private _ohlvFeed: OHLVFeed,
    private _windowManagerService: WindowManagerService,
    private _tradeHandler: TradeHandler,
    protected _changeDetectorRef: ChangeDetectorRef,
    public readonly _templatesService: TemplatesService,
    public readonly _modalService: NzModalService,
    public readonly _notifier: NotifierService,
  ) {
    super();
    this.componentInstanceId = Date.now();
    this.setTabIcon('icon-widget-dom');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    (window as any).dom = this;

    this.askSumItem = this._getItem(null);
    this.bidSumItem = this._getItem(null);
    this._lastAskItem = this._getItem(null);
    this._lastBidItem = this._getItem(null);
    this._lastTradeItem = this._getItem(null);

    this.columns = headers.map(item => convertToColumn(item));

    if (!environment.production) {
      this.columns.unshift(convertToColumn('_id'));
    }
  }

  public get account(): IAccount {
    return this._account;
  }

  public set account(value: IAccount) {
    if (this._account?.id === value?.id)
      return;

    this._account = value;
    this.centralize();
    this.handleAccountChange(value);
  }

  get isTradingLocked(): boolean {
    return !this._tradeHandler.isTradingEnabled$.value;
  }

  @ViewChild(AccountSelectComponent) private _accountsSelect: AccountSelectComponent;

  @ViewChild('domForm') domForm: SideOrderFormComponent;

  private _lastTradeItem: DomItem;
  pl = '-';
  @ViewChild('plInput', { static: false }) plInput;

  orders: IOrder[] = [];

  askSumItem: DomItem;
  bidSumItem: DomItem;

  _lastAskItem: DomItem;
  _lastBidItem: DomItem;

  private _marketDepth = 9;
  private _marketDeltaDepth = 9;

  columns: Column[] = [];
  keysStack: KeyboardListener = new KeyboardListener();
  firstOcoOrder: IOrder;
  secondOcoOrder: IOrder;
  ocoStep = OcoStep.None;
  position: IPosition;

  private _initialState: IDomState;
  private _account: IAccount;
  private currentRow: DomItem;

  domKeyHandlers = {
    autoCenter: () => this.centralize(),
    autoCenterAllWindows: () => this.broadcastHotkeyCommand('autoCenter'),
    buyMarket: () => this._createBuyMarketOrder(),
    sellMarket: () => this._createSellMarketOrder(),
    hitBid: () => {
      this._createOrderByCurrent(OrderSide.Sell, this._bestBidPrice);
    },
    joinBid: () => {
      this._createOrderByCurrent(OrderSide.Buy, this._bestBidPrice);
    },
    liftOffer: () => {
      this._createOrderByCurrent(OrderSide.Buy, this._bestAskPrice);
    },
    joinAsk: () => {
      this._createOrderByCurrent(OrderSide.Sell, this._bestAskPrice);
    },
    oco: () => {
      this.handleFormAction(FormActions.CreateOcoOrder);
    },
    flatten: () => this.handleFormAction(FormActions.Flatten),
    cancelAllOrders: () => this.handleFormAction(FormActions.CloseOrders),
    quantity1: () => this._handleQuantitySelect(QuantityPositions.FIRST),
    quantity2: () => this._handleQuantitySelect(QuantityPositions.SECOND),
    quantity3: () => this._handleQuantitySelect(QuantityPositions.THIRD),
    quantity4: () => this._handleQuantitySelect(QuantityPositions.FORTH),
    quantity5: () => this._handleQuantitySelect(QuantityPositions.FIFTH),
    quantityToPos: () => {
      this._domForm.positionsToQuantity();
    },
    stopsToPrice: () => {
      this.allStopsToPrice();
    },
    stopsToLimit: () => {
      this.allLimitToPrice();
    },
    clearAlerts: () => {
    },
    clearAlertsAllWindow: () => {
    },
    clearAllTotals: () => {
      for (const item of this.items) {
        item.totalBid.clear();
        item.totalAsk.clear();
      }
      this._max.clearTotal();
      this.recalculateMax();
    },
    clearCurrentTrades: () => {
      for (const item of this.items) {
        item.currentBid.clear();
        item.currentAsk.clear();
      }
      this.recalculateMax();
    },
    clearCurrentTradesAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTrades');
    },
    clearCurrentTradesDown: () => {
      this.forDownItems(item => {
        item.currentAsk.clear();
        item.currentBid.clear();
      });
      this.recalculateMax();
    },
    clearCurrentTradesDownAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTradesDown');
    },
    clearCurrentTradesUp: () => {
      this.forUpItems((item) => {
        item.currentAsk.clear();
        item.currentBid.clear();
      });
      this._calculateAskHist(true);
    },
    clearCurrentTradesUpAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTradesUp');
    },
    clearTotalTradesDown: () => {
      this.forDownItems((item) => {
        item.totalAsk.clear();
        item.totalBid.clear();
      });
      this._calculateAskHist(true);
    },
    clearTotalTradesDownAllWindows: () => {
      this.broadcastHotkeyCommand('clearTotalTradesDown');
    },
    clearTotalTradesUp: () => {
      this.forUpItems((item) => {
        item.totalAsk.clear();
        item.totalBid.clear();
      });
      this.recalculateMax();
    },
    clearTotalTradesUpAllWindows: () => {
      this.broadcastHotkeyCommand('clearTotalTradesUp');
    },
    clearVolumeProfile: () => {
      for (const item of this.items) {
        item.volume.clear();
      }
      this.recalculateMax();
    }
  };
  @ViewChild(SideOrderFormComponent)
  private _domForm: SideOrderFormComponent;
  draggingOrders: IOrder[] = [];
  draggingDomItemId: Id;

  dataGridMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  handlers: DataGridHandler[] = [
    new ContextMenuClickDataGridHandler<DomItem>({
      handleHeaderClick: true,
      handler: (data, event) => {
        if (!data.item) {
          this.dataGrid.createComponentModal(event);
        } else if (OrderColumns.includes(data.column.name)) {
          this._cancelOrderByClick(data.column.name, data.item, event);
        }
      }
    }),
    new CellClickDataGridHandler<DomItem>({
      column: [DOMColumns.Ask, DOMColumns.Bid],
      handler: (data, event) => this._createOrderByClick(data.column.name, data.item, event),
    }),
    new MouseDownDataGridHandler<DomItem>({
      column: OrderColumns,
      handler: (data) => {
        // it is because delta column doesn't contain orders
        const orders = data.item[data.column.name].orders || data.item.askDelta.orders;
        if (orders.length) {
          this.draggingDomItemId = data.item.index;
          this.draggingOrders = orders;
        }
      },
    }),
    new MouseUpDataGridHandler<DomItem>({
      column: OrderColumns,
      handler: (data) => {
        if (this.draggingDomItemId && this.draggingDomItemId !== data.item.index) {
          this._setPriceForOrders(this.draggingOrders, +data.item.price.value);
        }
        this.draggingDomItemId = null;
        this.draggingOrders = [];
      }
    }),
  ];

  private _updatedAt: number;
  private _levelsInterval: number;
  private _clearInterval: () => void;
  private _upadateInterval: number;
  private _customTickSize: number;

  readonly directionsHints = directionsHints;
  directions: FormDirection[] = Object.keys(FormDirection).map(key => FormDirection[key]);
  currentDirection = FormDirection.Right;

  @ViewChild(DataGrid, { static: true })
  dataGrid: DataGrid;

  @ViewChild(DataGrid, { read: ElementRef })
  dataGridElement: ElementRef;

  private _isFormOpen = true;
  public get isFormOpen() {
    return this._isFormOpen;
  }

  public set isFormOpen(value) {
    this._isFormOpen = value;
    requestAnimationFrame(() => this._validateComponentWidth());
  }

  get bracketActive() {
    return this._settings.trading?.trading?.bracketButton === true;
  }

  set bracketActive(value: boolean) {
    this._settings.trading.trading.bracketButton = value;
    this._linkSettings(this._settings);
    this.broadcastData(receiveSettingsKey + this._getSettingsKey(), this._settings);
  }

  isExtended = true;
  isTradingEnabled = true;

  @ViewChild(InstrumentSelectComponent) private _instrumentSelect: InstrumentSelectComponent;

  @ViewChildren(DailyInfoComponent) dailyInfoComponents: QueryList<DailyInfoComponent>;

  private _instrument: IInstrument;
  _priceFormatter: IFormatter;

  visibleRows = 0;

  private _max = new DomItemMax();
  // private _lastChangesItem: { [key: string]: DomItem } = {};

  private _map = new Map<number, DomItem>();

  private _lastTrade: TradePrint;

  private _settings: DomSettings = new DomSettings();

  private _bestBidPrice: number;
  private _bestAskPrice: number;

  // the problem is that current ask/bid doesn't clear "inside" status. So need to check all trading prices.
  // current(Ask, Bid)Range contains range of traded indexes
  currentAskRange = { minIndex: null, maxIndex: null };
  currentBidRange = { minIndex: null, maxIndex: null };
  componentInstanceId: number;

  dailyInfo: Partial<IHistoryItem>;

  protected _ttt = 0;

  private _calcTickSize() {
    const { ticksMultiplier, useCustomTickSize } = this._settings.general.commonView;
    const multiplier = useCustomTickSize ? ticksMultiplier : 1;
    return multiplier * this._tickSize;
  }

  handleLinkData({ instrument, account }) {
    if (instrument)
      this.instrument = instrument;
    if (instrument)
      this.instrument = instrument;
    if (account)
      this.account = account;
  }

  showColumnTitleOnHover = (item: Column) => false;

  ngOnInit(): void {
    super.ngOnInit();

    this._tradeHandler.isTradingEnabled$
      .pipe(untilDestroyed(this))
      .subscribe((enabled) => this.isTradingEnabled = enabled);

    // setInterval(() => {
    //   if (!this.items.length)
    //     this.fillData(100);

    //   const volume = Math.random() > 0.5 ? 2 : 4;
    //   let price = this.items[this.items.length - 1].lastPrice;
    //   const high = this.items[0].lastPrice;
    //   const centerPrice = this.items[Math.floor(this.items.length / 2)].lastPrice;

    //   while (price <= high) {
    //     if (price !== centerPrice) {
    //       // this._handleTrade({
    //       //   price,
    //       //   instrument: this._instrument,
    //       //   side: OrderSide.Sell,
    //       //   timestamp: Date.now(),
    //       //   volume: 1,
    //       //   volumeBuy: 1,
    //       //   volumeSell: 1,
    //       // });
    //       const isBid = price < centerPrice;

    //       this._handleQuote({
    //         price,
    //         instrument: this._instrument,
    //         side: isBid ? QuoteSide.Bid : QuoteSide.Ask,
    //         // side: QuoteSide.Bid,
    //         timestamp: Date.now(),
    //         volume,
    //         orderCount: 1,
    //         updateType: ((isBid && this._normalizePrice(price + this._tickSize) === centerPrice) || (!isBid && this._normalizePrice(price - this._tickSize) === centerPrice)) ? UpdateType.Undefined : UpdateType.Solo,
    //       });
    //     }

    //     price = this._normalizePrice(price + this._tickSize);
    //   }

    //   this._handleTrade({
    //     price: centerPrice,
    //     instrument: this._instrument,
    //     // side: OrderSide.Sell,
    //     side: Math.random() > 0.5 ? OrderSide.Sell : OrderSide.Buy,
    //     timestamp: Date.now(),
    //     volume: 1,
    //     volumeBuy: 1,
    //     volumeSell: 1,
    //   });

    //   // this._handleQuote({
    //   //   price: centerPrice,
    //   //   instrument: this._instrument,
    //   //   side: QuoteSide.Bid,
    //   //   timestamp: Date.now(),
    //   //   volume,
    //   //   orderCount: 1,
    //   //   updateType: Math.random() > 0.6 ? UpdateType.Undefined : UpdateType.Solo,
    //   // });
    // }, 1000);
  }

  ngAfterViewInit() {
    this._handleResize();
    this._validateComponentWidth();
    // this._ordersRepository.actions
    //   .pipe(untilDestroyed(this))
    //   .subscribe((action) => this._handleOrdersRealtime(action));

    this.onRemove(
      this._levelOneDatafeed.on(filterByConnectionAndInstrument(this, (item: IQuote) => this._handleQuote(item))),
      this._tradeDatafeed.on(filterByConnectionAndInstrument(this, (item: TradePrint) => this._handleTrade(item))),
      this._ordersFeed.on(filterByAccountAndInstrument(this, (order: IOrder) => this._handleOrders([order]))),
      this._positionsFeed.on(filterPositions(this, (pos: IPosition) => this.handlePosition(pos))),
      this._ohlvFeed.on(filterByConnectionAndInstrument(this, (ohlv) => this.handleOHLV(ohlv)))
    );

    this._onInstrumentChange(this.instrument);
    this.domForm.loadState(this._initialState.orderForm);
  }

  save(): void {
    const presets: IDomPresets = {
      id: this.loadedPresets?.id,
      name: this.loadedPresets?.name,
      type: Components.Dom
    };

    this.savePresets(presets);
  }

  handleAccountChange(account: IAccount) {
    this.domForm.loadState(this._initialState.orderForm);

    this._loadData();
    this._onInstrumentChange(this.instrument, true);
  }

  private _observe() {
    this.addLinkObserver({
      link: DOM_HOTKEYS,
      layoutContainer: this.layoutContainer,
      handleLinkData: (key: string) => this.handleHotkey(key),
    });
    this.addLinkObserver({
      link: this._getSettingsKey(),
      layoutContainer: this.layoutContainer,
      handleLinkData: this._linkSettings,
    });
  }

  private _getSettingsKey() {
    return `${this.componentInstanceId}.${DomSettingsSelector}`;
  }

  private _linkSettings = (settings: DomSettings) => {
    settings.buyOrders = { ...settings.orders, backgroundColor: settings.orders.buyOrdersBackgroundColor };
    settings.sellOrders = { ...settings.orders, backgroundColor: settings.orders.sellOrdersBackgroundColor };

    const common = settings.common;
    const general = settings?.general;
    const getFont = (fontWeight) => `${fontWeight || ''} ${common.fontSize}px ${common.fontFamily}`;
    const hiddenColumns: any = {};

    const hasSplitOrdersChanged = this._settings.orders.split !== settings.orders.split;
    common.orders = !settings.orders.split && (common.orders || hasSplitOrdersChanged);
    hiddenColumns.orders = settings.orders.split;
    common.buyOrders = settings.orders.split && (common.buyOrders || hasSplitOrdersChanged);
    hiddenColumns.buyOrders = !settings.orders.split;
    common.sellOrders = settings.orders.split && (common.sellOrders || hasSplitOrdersChanged);
    hiddenColumns.sellOrders = !settings.orders.split;

    if (common) {
      for (const column of this.columns) {
        column.visible = common[column.name] != false;
        if (column.name in hiddenColumns)
          column.hidden = hiddenColumns[column.name] == true;
      }
    }
    this.dataGrid.applyStyles({
      font: getFont(common.fontWeight),
      gridBorderColor: common.generalColors.gridLineColor,
      gridHeaderBorderColor: common.generalColors.gridLineColor,
      scrollSensetive: general.intervals.scrollWheelSensitivity,
    });

    // this.setZIndex(general.commonView.onTop ? 500 : null);

    const minToVisible = general?.marketDepth?.bidAskDeltaFilter ?? 0;
    const clearTradersTimer = general.intervals.clearTradersTimer ?? 0;
    const overlayOrders = settings.orders.overlayOrders;
    const levelInterval = general.intervals.momentumIntervalMs;
    const momentumTails = general.intervals.momentumTails;

    settings.currentAsk.clearTradersTimer = clearTradersTimer;
    settings.currentBid.clearTradersTimer = clearTradersTimer;
    settings.currentAsk.levelInterval = levelInterval;
    settings.currentBid.levelInterval = levelInterval;
    settings.currentBid.tailInsideFont = getFont(settings.currentBid.tailInsideBold ? 200 : 700);
    settings.currentAsk.tailInsideFont = getFont(settings.currentAsk.tailInsideBold ? 200 : 700);
    settings.currentBid.clearOnBest = momentumTails;
    settings.currentAsk.clearOnBest = momentumTails;
    settings.currentBid.momentumTails = momentumTails;
    settings.currentAsk.momentumTails = momentumTails;

    settings.askDelta = {
      ...settings.askDelta,
      sellOrderBackgroundColor: settings.orders.sellOrderBackgroundColor,
      sellOrderColor: settings.orders.sellOrderColor,
      overlayOrders,
      minToVisible,
    };
    settings.bidDelta = {
      ...settings.bidDelta,
      buyOrderBackgroundColor: settings.orders.buyOrderBackgroundColor,
      buyOrderColor: settings.orders.buyOrderColor,
      overlayOrders,
      minToVisible,
    };

    for (const key of [DOMColumns.CurrentAsk, DOMColumns.CurrentBid]) {
      const obj = settings[key];
      if (!obj)
        continue;

      const tailInside = extractStyles(obj, TailInside);

      for (const level of LEVELS) {
        const status = Cell.mergeStatuses(TailInside, level);
        const styles = {
          ...extractStyles(obj, level),
          ...tailInside,
        };

        for (const _key in styles) {
          if (styles.hasOwnProperty(_key)) {
            obj[Cell.mergeStatuses(status, _key)] = styles[_key];
          }
        }
      }
    }

    const deltaStyles: any = {};
    for (const key of [DOMColumns.BidDelta, DOMColumns.AskDelta]) {
      const obj = settings[key];
      if (!obj)
        continue;

      for (const _key in obj) {
        if (obj.hasOwnProperty(_key)) {
          deltaStyles[`${key}${_key}`] = obj[_key];
          deltaStyles[`${key}${capitalizeFirstLetter(_key)}`] = obj[_key];
        }
      }
    }
    deltaStyles.askDeltahighlightColor = settings[DOMColumns.AskDelta].color;
    deltaStyles.askDeltahighlightTextAlign = settings[DOMColumns.AskDelta].textAlign;
    deltaStyles.bidDeltahighlightColor = settings[DOMColumns.BidDelta].color;
    deltaStyles.bidDeltahighlightTextAlign = settings[DOMColumns.BidDelta].textAlign;

    settings.delta = deltaStyles;

    this._levelsInterval = levelInterval;
    this._levelsInterval = levelInterval;
    this._upadateInterval = general.intervals.updateInterval;

    this._settings.merge(settings);
    const useCustomTickSize = general?.commonView?.useCustomTickSize;
    if ((useCustomTickSize && this._customTickSize != general?.commonView?.ticksMultiplier)
      || (!useCustomTickSize && this._customTickSize != null)) {
      this.centralize();
      // this._calculateDepth();
    }
    const sessions = this._settings.volume.sessions;
    const { eth, rth } = sessions;

    const oldEth = this.eth;
    const oldRth = this.rth;
    const hasSessionChanged = oldEth?.id !== eth?.id || oldRth?.id !== rth?.id;

    this.eth = eth;
    this.rth = rth;

    for (const i of this.items) {
      i.ltq.changeStatus('');
      i.currentBid.changeStatus('');
      i.currentAsk.changeStatus('');
      i.totalAsk.changeStatus('');
      i.totalBid.changeStatus('');
      if (hasSessionChanged)
        i.volume.recalculateVolume();
    }

    const depth = settings.general?.marketDepth;
    this._marketDepth = depth?.marketDepth ?? 10000;
    this._marketDeltaDepth = depth?.bidAskDeltaDepth ?? 10000;
    this.domForm?.loadState({ settings: mapSettingsToSideFormState(settings) });
    this.updatePl();
    this.refresh();
    this._updateVolumeColumn();
    this._validateComponentWidth();
    this.detectChanges(true);
  }

  refresh() {
    this._updateVolumeColumn();
    this._fillPL();
    if (this._bestAskPrice == null) {
      this._bestAskPrice = this._lastPrice;
    }
    if (this._bestBidPrice == null) {
      this._bestBidPrice = this._lastPrice;
    }
    this.items.forEach((i, index) => {
      i.side = this._bestAskPrice <= i.price._value ? QuoteSide.Ask : QuoteSide.Bid;
      i.refresh();
      i.setAskVisibility(true, true);
      i.setBidVisibility(true, true);
      if (this._settings.common.generalColors.enableOrderGridColor && i.orders.order)
        i.styles.addStyle({ cellsBorderColor: this._settings.common.generalColors.orderGridLineColor });
      else
        i.styles.deleteStyle('cellsBorderColor');
      i.index = index;
    });
    this._applyOffset();
    this.domForm?.loadState({ settings: mapSettingsToSideFormState(this._settings) });
  }

  allStopsToPrice() {
    this._setPriceForAllOrders(OrderType.StopMarket);
  }

  allLimitToPrice() {
    this._setPriceForAllOrders(OrderType.Limit);
  }

  _setPriceForAllOrders(type: OrderType) {
    if (this.currentRow) {
      // #TODO investigate what side should be if row is in center
      const side = this.currentRow.isCenter ? OrderSide.Buy : OrderSide.Sell;
      const orders = this.items.reduce((total, item) => {
        return total.concat(item.orders.orders.filter(order => {
          return order.type === type && order.side === side;
        }));
      }, []);
      const price = +this.currentRow.price.value;
      this._setPriceForOrders(orders, price);
    }
  }

  updatePl() {
    requestAnimationFrame(this._updatePl);
  }

  private _updatePl = () => {
    const position = this.position;

    if (!position || position.side === Side.Closed) {
      this.pl = '-';
      if (this.plInput && this.plInput.nativeElement)
        this.plInput.nativeElement.value = this.pl;
    }

    const includeRealizedPl = this.domFormSettings.includeRealizedPL;
    const price = this._lastTradeItem.price._value ?? 0;
    const i = this.instrument;
    const precision = this.domFormSettings.roundPL ? 0 : (i?.precision ?? 2);
    const pl = calculatePL(position, price, this._tickSize, i?.contractSize, includeRealizedPl);
    if (pl == null)
      return;

    if (this.instrument?.fraction == null)
      this.pl = pl.toFixed(precision);

    this.pl = this._priceFormatter.format(pl);
    if (this.plInput && this.plInput.nativeElement)
      this.plInput.nativeElement.value = this.pl;
  }

  _setPriceForOrders(orders: IOrder[], price: number) {
    const amount = this.domForm.getDto().amount;

    orders.map(item => {
      item.amount = amount;
      const priceTypes = this._getPriceSpecs(item as IOrder & { amount: number }, price);

      return {
        quantity: item.quantity,
        type: item.type,
        ...priceTypes,
        duration: item.duration,
        id: item.id,
        account: item.account,
        accountId: item.account?.id,
        instrument: item.instrument,
        symbol: item.instrument.symbol,
        exchange: item.instrument.exchange,
      };
    }).forEach(item => this._ordersRepository.updateItem(item).toPromise());
  }

  private _createOrderByCurrent(side: OrderSide, price: number) {
    if (price)
      this._createOrder(side, +price);
  }

  handleHotkey(key) {
    this.domKeyHandlers[key]();
  }

  _updateDailyInfoComponent = () => {
    this.dailyInfoComponents?.forEach(item => {
      item.handleDailyInfo(this.dailyInfo as IHistoryItem);
    });
  }

  handleOHLV(ohlv) {
    this.dailyInfo = { ...ohlv };
    requestAnimationFrame(this._updateDailyInfoComponent);
  }

  handlePosition(pos) {
    const newPosition: IPosition = RealPositionsRepository.transformPosition(pos);
    const oldPosition = this.position;

    if (compareInstruments(this.instrument, pos.instrument)) {
      if (oldPosition && oldPosition.side !== Side.Closed) {
        const newPosPrice = roundToTickSize(newPosition.price, this._tickSize);
        const oldPosPrice = roundToTickSize(oldPosition.price, this._tickSize);
        const oldItem = this._getItem(oldPosPrice);
        if (newPosPrice !== oldPosPrice)
          oldItem.revertPriceStatus();
      }
      this._applyPositionSetting(oldPosition, newPosition);
      this.position = newPosition;
      this.domForm.position = this.position;
      this._applyPositionStatus();
      this.updatePl();
      requestAnimationFrame(this.markForCheck);
    }
  }

  markForCheck = () => {
    this._changeDetectorRef.markForCheck();
  }

  _applyPositionSetting(oldPosition: IPosition, newPosition: IPosition) {
    const {
      closeOutstandingOrders,
    } = this._settings.general;

    const isOldPositionOpened = oldPosition && oldPosition.side !== Side.Closed;
    const isNewPositionOpened = newPosition.side !== Side.Closed;

    const isNewPosition = !isOldPositionOpened && isNewPositionOpened;


    if (isNewPosition) {
      // #TODO test all windows
      this.applySettingsOnNewPosition();
    } else if (closeOutstandingOrders && isOldPositionOpened && !isNewPositionOpened) {
      this.deleteOutstandingOrders();
    }

    if (isNewPositionOpened) {
      this._fillPL();
    } else {
      this._removePL();
    }
  }

  private _removePL() {
    for (const i of this.items) {
      i.clearPL();
    }
  }

  private _fillPL() {
    const position = this.position;
    const ordersSettings = this._settings[SettingTab.Orders];
    const contractSize = this._instrument?.contractSize;

    for (const i of this.items) {
      const pl = ordersSettings.showPL ?
        calculatePL(position, i.price._value, this._tickSize, contractSize, ordersSettings.includeRealizedPL) : null;
      i.setPL(pl);
    }
  }

  applySettingsOnNewPosition() {
    const {
      recenter,
      clearCurrentTrades,
      clearTotalTrades,
      currentTotalAllWindows,
      recenterTotalAllWindows,
      currentTradesAllWindows,
    } = this._settings.general;
    if (clearCurrentTrades) {
      if (currentTradesAllWindows) {
        this.domKeyHandlers.clearCurrentTradesAllWindows();
      } else
        this.domKeyHandlers.clearCurrentTrades();
    }
    if (clearTotalTrades) {
      if (currentTotalAllWindows) {
        this.domKeyHandlers.clearTotalTradesDownAllWindows();
        this.domKeyHandlers.clearTotalTradesUpAllWindows();
      } else {
        this.domKeyHandlers.clearTotalTradesDown();
        this.domKeyHandlers.clearTotalTradesUp();
      }
    }
    if (recenter) {
      if (recenterTotalAllWindows) {
        this.domKeyHandlers.autoCenterAllWindows();
      } else {
        this.domKeyHandlers.autoCenter();
      }
    }
  }

  deleteOutstandingOrders() {
    const orders = this.items.reduce((acc: any[], i) => ([...acc, ...i.orders.orders]), [])
      .filter(item => item.status === OrderStatus.Pending);

    this._ordersRepository.deleteMany(orders)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.notifier.showSuccess('Success');
      }, (err) => this.notifier.showError(err));
  }

  _handleOrdersRealtime(action: RepositoryActionData<IOrder>) {
    if (action.items)
      this._handleOrders(action.items);

    this.detectChanges();
  }

  _onInstrumentChange(prevInstrument: IInstrument, force = false) {
    const instrument = this.instrument;
    if (!this.account || !instrument)
      return;

    if (force || instrument?.id != null && instrument?.id !== prevInstrument?.id) {
      this.dailyInfo = null;
      this._updateDailyInfoComponent();

      const connectionId = this.account?.connectionId;
      if (connectionId != null) {
        this._levelOneDatafeed.subscribe(instrument, connectionId);
        this._tradeDatafeed.subscribe(instrument, connectionId);
        this._ohlvFeed.subscribe(instrument, connectionId);
      }

      this.unsubscribe(() => {
        this._levelOneDatafeed.unsubscribe(instrument, connectionId);
        this._tradeDatafeed.unsubscribe(instrument, connectionId);
        this._ohlvFeed.unsubscribe(instrument, connectionId);
      });
    }

    this._priceFormatter = InstrumentFormatter.forInstrument(instrument);

    this._loadData();
  }

  protected _loadOrderBook() {
    if (!this.accountId || !this._instrument)
      return;

    const { symbol, exchange } = this._instrument;
    this._orderBooksRepository.getItems({ symbol, exchange, accountId: this.accountId })
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          this._clear();

          const { asks, bids } = res.data[0];

          bids.sort((a, b) => a.price - b.price);
          asks.sort((a, b) => b.price - a.price);

          if (asks.length || bids.length) {
            let price = this._normalizePrice(asks[asks.length - 1]?.price);
            const tickSize = this._tickSize;


            price = this._normalizePrice(asks[asks.length - 1]?.price - tickSize);

            this.fillData(price);
            this._lastTradeItem = this._getItem(price);

            const instrument = this.instrument;
            asks.forEach((info, i) => this._handleQuote({
              instrument,
              price: info.price,
              timestamp: 0,
              volume: info.volume,
              side: QuoteSide.Ask,
              updateType: i === asks.length - 1 ? UpdateType.Undefined : UpdateType.Middle,
            } as IQuote));
            bids.forEach((info, i) => this._handleQuote({
              instrument,
              price: info.price,
              timestamp: 0,
              volume: info.volume,
              side: QuoteSide.Bid,
              updateType: i === bids.length - 1 ? UpdateType.Undefined : UpdateType.Middle,
            } as IQuote));

            for (const i of this.items) {
              i.clearDelta();
              i.dehighlight();
            }
          }

          this.refresh();
          this._fillPL();
          this._loadOrders();
          this.loadSessionsData();
          this.centralize();
        },
        error => this.notifier.showError(error)
      );

  }

  loadSessionsData() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    const { symbol, exchange } = this._instrument;
    const params = {
      Symbol: symbol,
      Exchange: exchange,
      productCode: this._instrument.productCode,
      startDate, endDate,
      barSize: 1,
      periodicity: 'Minute',
      accountId: this.accountId,
      PriceHistory: true,
    };

    this._historyRepository.getItems(params)
      .pipe(untilDestroyed(this))
      .subscribe(
        ({ data }) => {
          let volumeItems = [];
          this.items.forEach(item => item.volume.clear());

          for (const item of data) {
            for (const detail of item.details) {
              volumeItems.push(({
                date: item.date,
                volume: detail.volume,
                price: detail.price,
              }));
            }
          }

          volumeItems = volumeItems.sort((a, b) => a.date - b.date);

          for (const volumeData of volumeItems) {
            const item = this._getItem(volumeData.price);
            // item.volume.clear();
            item.volume.updateValue(volumeData.volume, volumeData.date);
          }
          this._updateVolumeColumn();
          // this.fillSessionVolume();
        },
        (err) => {
          console.error(err);
          this.notifier.showError(err);
        }
      );
  }

  protected _loadOrders(): void {
    if (!this.account)
      return;

    this.orders = [];
    this._ordersRepository.getItems({ accountId: this.accountId, hideStopped: true })
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          const orders = res.data;
          if (!Array.isArray(orders))
            return;

          this._handleOrders(orders);
        },
        error => this.notifier.showError(error),
      );
  }

  private _handleOrders(orders: IOrder[]) {
    for (const order of orders) {
      if (order.account.id !== this.account?.id || order.instrument?.id !== this.instrument?.id) continue;

      this.items.forEach(i => i.removeOrder(order));
      this._fillOrders(order);

      const item = this._getItem(getPrice(order));
      if (!item)
        continue;

      item.handleOrder(order);
    }

    this.detectChanges(true);
    this._changeDetectorRef.detectChanges();
  }

  private _fillOrders(order) {
    if (isForbiddenOrder(order)) {
      this.orders = this.orders.filter(item => item.id !== order.id);
      return;
    }

    const index = this.orders.findIndex(item => item.id === order.id);

    if (!this.orders.length || index === -1)
      this.orders = [...this.orders, order];
    else {
      this.orders[index] = order;
      this.orders = [...this.orders];
    }
  }

  protected _loadData() {
    if (!this.accountId || !this._instrument)
      return;

    this._loadPositions();
    this._loadOrderBook();
    this.currentAskRange.minIndex = null;
    this.currentAskRange.maxIndex = null;
    this.currentBidRange.minIndex = null;
    this.currentBidRange.maxIndex = null;
    this.refresh();
  }

  protected _loadPositions() {
    const hide = this.showLoading();
    this._positionsRepository.getItems({ accountId: this.accountId })
      .pipe(finalize(hide), untilDestroyed(this))
      .subscribe(items => {
        this.position = items.data.find(item => compareInstruments(item.instrument, this.instrument));
        this._applyPositionStatus();
        this._fillPL();
      }, err => hide());
  }

  private _applyPositionStatus() {
    if (this.position == null || this.position.side === Side.Closed)
      return;

    const prefix = this.position.side.toLowerCase();
    const newItem = this._getItem(roundToTickSize(this.position.price, this._tickSize));
    newItem.changePriceStatus(prefix + openPositionSuffix);
  }

  broadcastHotkeyCommand(commandName: string) {
    this.broadcastData(DOM_HOTKEYS, commandName);
  }

  forUpItems(handler: (data) => void) {
    let emit = true;
    for (const item of this.items) {
      if (item.isCenter)
        emit = false;

      if (emit)
        handler(item);
    }
  }

  forDownItems(handler: (item) => void) {
    let emit = false;
    for (const item of this.items) {
      if (item.isCenter)
        emit = true;

      if (emit)
        handler(item);
    }
  }

  _getDomItemsMap() {
    let map = {};

    for (const i of this.items) {
      map = {
        ...map,
        ...((i as CustomDomItem).getDomItems ? (i as CustomDomItem).getDomItems() : {}),
        ...((i instanceof DomItem && !(i instanceof CustomDomItem)) ? { [i.lastPrice]: i } : {})
      };
    }

    return map;
  }

  private _centralize = () => {
    const grid = this.dataGrid;
    const visibleRows = grid.getVisibleRows();
    let centerIndex = this._getItem(this._lastPrice).index ?? ROWS / 2;
    const lastPrice = this._lastPrice;

    if (!lastPrice)
      return;

    const commonView = this._settings.general.commonView;
    const ticksMultiplier = commonView.useCustomTickSize ? commonView.ticksMultiplier : null;
    if (ticksMultiplier !== this._customTickSize) {
      const map = this._getDomItemsMap();
      this._map.clear();
      this.items = [];
      centerIndex = ROWS / 2;
      let offset = 0;

      const tickSize = this._tickSize;
      const multiplier = ticksMultiplier ?? 1;
      const _lastPrice = this._normalizePrice(lastPrice + (ROWS / 2 * tickSize * multiplier));
      const decimals = _lastPrice % 1;
      const startPrice = _lastPrice + (decimals > 0.5 ? (1 - decimals) : (decimals - 1));

      while (offset <= ROWS) {
        const customItemData: { [key: number]: DomItem } = {};
        const prices = [];

        for (let m = 0; m < multiplier; m++) {
          const price = this._normalizePrice(startPrice - (offset * multiplier + m) * tickSize);

          prices.push(price);
          customItemData[price] = map[price] ?? new DomItem(null, this._settings, this._priceFormatter, customItemData);
          const _item = customItemData[price];

          if (_item.isAskSum) {
            _item.clearAskSum();
          }
          if (_item.isBidSum) {
            _item.clearBidSum();
          }

          _item.setAskVisibility(false, false);
          _item.setBidVisibility(false, false);
          customItemData[price].setPrice(price);
        }

        const item = multiplier === 1 ? customItemData[prices[0]] :
          new CustomDomItem(offset, this._settings, this._priceFormatter, customItemData);
        item.setPrice(prices[0]);
        this.items[offset] = item;
        prices.forEach(p => this._map.set(p, item));

        offset++;
      }
    }

    if (this._lastPrice) {
      const items = this.items;
      const _item = this._getItem(this._lastPrice);
      centerIndex = _item?.index ?? (ROWS / 2);
      for (let i = 0; i < this.items.length; i++) {
        items[i].isCenter = i === centerIndex;
      }
    }

    this._customTickSize = ticksMultiplier;
    grid.scrollTop = centerIndex * grid.rowHeight - visibleRows / 2 * grid.rowHeight;
    this._fillPL();
    this.refresh(); // for fill correct index
    this.detectChanges();
    this._needCentralize = false;
  }

  centralize = () => requestAnimationFrame(this._centralize);

  detectChanges(force = false) {
    if (!this._shouldDraw)
      return;

    if (!force && (this._updatedAt + this._upadateInterval) > Date.now())
      return;

    this.dataGrid.detectChanges(force);
    this._updatedAt = Date.now();
  }

  private _getItem(price: number, index?: number): DomItem {
    let item = this._map.get(price);
    if (!item) {
      // if (index == null)
      //   console.warn('Omit index', index);

      item = new DomItem(index, this._settings, this._priceFormatter);
      this._map.set(price, item);
      item.setPrice(price);

      const pos = this.position;
      if (price != null && price === pos?.price && pos?.side !== Side.Closed) {
        item.changePriceStatus(pos.side === Side.Long ? OpenPositionStatus.LongPositionOpen : OpenPositionStatus.ShortPositionOpen);
      }
    }

    return item;
  }

  private _clear() {
    this.items = [];
    this._map.clear();
    this._max.clear();
  }

  // private _fillData(lastPrice: number) {
  //   this.items = [];
  //   this._map.clear();
  //   this._max.clear()
  //   const data = this.items;
  //   const tickSize = this._tickSize;

  //   let price = this._normalizePrice(lastPrice - tickSize * ROWS / 2);
  //   const maxPrice = this._normalizePrice(lastPrice + tickSize * ROWS / 2);

  //   while (price < maxPrice) {
  //     price = this._normalizePrice(price);
  //     data.push(this._getItem(price));
  //   }
  // }

  protected _handleTrade(trade: TradePrint) {
    const prevltqItem = this._lastTradeItem;
    const prevHandled = prevltqItem && prevltqItem.price != null;
    let needCentralize = this._needCentralize || false;
    const max = this._max;

    const _item = this._getItem(trade.price);

    if (trade.side === OrderSide.Sell) {
      if ((this.currentAskRange.minIndex ?? Infinity) > _item.index) {
        this.currentAskRange.minIndex = _item.index;
      }
      if ((this.currentAskRange.maxIndex ?? -Infinity) < _item.index) {
        this.currentAskRange.maxIndex = _item.index;
      }
    } else {
      if ((this.currentBidRange.minIndex ?? Infinity) > _item.index) {
        this.currentBidRange.minIndex = _item.index;
      }
      if ((this.currentBidRange.maxIndex ?? -Infinity) < _item.index) {
        this.currentBidRange.maxIndex = _item.index;
      }
    }

    if (prevltqItem?.lastPrice !== trade.price) {
      if (prevltqItem)
        prevltqItem.clearLTQ();

      const settings = this._settings.general.commonView;
      if (settings.autoCenter && settings.autoCenterTicks) {
        const offset = settings.autoCenterTicks;
        const index = _item.index;
        let i = 0;

        while (i < offset) {
          if (this.items[index + i]?.isCenter || this.items[index - i]?.isCenter)
            break;

          i++;
        }

        if (i === offset)
          needCentralize = true;
      }
    }

    if (!this.items.length)
      this.fillData(trade.price);

    _item.handleTrade(trade);

    if (trade.side === OrderSide.Sell) {
      if (_item.totalBid._value > max.totalBid) {
        max.totalBid = _item.totalBid._value;
        // this._updateVolumeColumn();
      }
    } else {
      if (_item.totalAsk._value > max.totalAsk) {
        max.totalAsk = _item.totalAsk._value;
        // this._updateVolumeColumn();
      }
    }

    if (!prevHandled || needCentralize)
      this.centralize();

    this._lastTrade = trade;
    this._lastTradeItem = _item;
    this.updatePl();

    requestAnimationFrame(this._updateVolumeAndLevels);

    if (trade.side === OrderSide.Sell) {
      this._lastBidItem.totalBid.dehightlight();
      _item.totalBid.hightlight();
      this._lastBidItem = _item;
    } else {
      this._lastAskItem.totalAsk.dehightlight();
      _item.totalAsk.hightlight();
      this._lastAskItem = _item;
    }

    this.detectChanges();
  }

  private _updateVolumeAndLevels = () => {
    this._calculateLevels();
    this._updateVolumeColumn();
  }

  private _updateVolumeColumn() {
    const _max = this._max;
    const settings: any = this._settings.volume;

    const VWAP = settings.VWAP;
    const ltq = settings.ltq;
    const poc = settings.poc;
    const valueArea = settings.valueArea;

    let sum = 0;
    let max = 0;
    let pointOfControlIndex;
    let startTradedPriceIndex;
    let endTradedPriceIndex;
    let item;
    let priceSum = 0;
    let maxCurrentAsk = 0;
    let maxCurrentBid = 0;

    let maxVolume = 0;
    let maxSessionVolume = 0;

    const items = this.items;

    for (let i = 0; i < items.length; i++) {
      item = items[i];
      const value = item.volume._value;

      if (item.currentAsk._value > maxCurrentAsk)
        maxCurrentAsk = item.currentAsk._value;

      if (item.currentBid._value > maxCurrentBid)
        maxCurrentBid = item.currentBid._value;

      if (!value)
        continue;

      if (startTradedPriceIndex == null)
        startTradedPriceIndex = i;

      endTradedPriceIndex = i;

      sum += value;
      priceSum += (value * item.lastPrice);

      if (value > maxVolume)
        maxVolume = value;

      const ethVolume = item.volume.ethVolume;

      if (ethVolume > maxSessionVolume)
        maxSessionVolume = ethVolume;

      if (value > max) {
        max = value;
        pointOfControlIndex = i;
      }
    }

    const vwap = this._normalizePrice(priceSum / sum);

    let i = 0;
    const valueAreaNum = sum * 0.7;
    let ended = false;
    let valueAreaSum = 0;
    let item1: DomItem;
    let item2: DomItem;
    let volume1: VolumeCell;
    let volume2: VolumeCell;

    while (!ended) {
      item1 = items[pointOfControlIndex + i];
      item2 = items[pointOfControlIndex - i];

      if (item1 === item2)
        item1 = null;

      volume1 = item1?.volume;
      volume2 = item2?.volume;

      if (item1) {
        item1.currentBid.calcHist(maxCurrentBid);
        item1.currentAsk.calcHist(maxCurrentAsk);

        item1.totalBid.calcHist(_max.totalBid);
        item1.totalAsk.calcHist(_max.totalAsk);
      }
      if (item2) {
        item2.currentBid.calcHist(maxCurrentBid);
        item2.currentAsk.calcHist(maxCurrentAsk);

        item2.totalBid.calcHist(_max.totalBid);
        item2.totalAsk.calcHist(_max.totalAsk);
      }

      volume1?.changeStatus(VolumeStatus.Empty);
      volume2?.changeStatus(VolumeStatus.Empty);

      if (!volume1 && !volume2)
        break;

      if (pointOfControlIndex + i <= endTradedPriceIndex)
        items[pointOfControlIndex + i].changePriceStatus(VolumeStatus.TradedPrice);

      if (pointOfControlIndex - i >= startTradedPriceIndex)
        items[pointOfControlIndex - i].changePriceStatus(VolumeStatus.TradedPrice);

      valueAreaSum += (volume1?._value || 0);
      if (valueArea && valueAreaSum <= valueAreaNum)
        volume1?.changeStatus(VolumeStatus.ValueArea);

      valueAreaSum += (volume2?._value || 0);
      if (valueArea && valueAreaSum <= valueAreaNum)
        volume2?.changeStatus(VolumeStatus.ValueArea);

      if (VWAP) {
        if (volume1 && vwap === items[pointOfControlIndex + i]?.lastPrice) {
          volume1.changeStatus(VolumeStatus.VWAP);
        } else if (volume2 && vwap === items[pointOfControlIndex - i].lastPrice) {
          volume2.changeStatus(VolumeStatus.VWAP);
        }
      }

      volume1?.setMaxEthVolume(maxSessionVolume);
      volume2?.setMaxEthVolume(maxSessionVolume);
      volume1?.calcHist(maxVolume);
      volume2?.calcHist(maxVolume);

      i++;
      ended = sum === valueAreaSum;
    }

    if (ltq && this._lastTradeItem) {
      this._lastTradeItem.volume.hightlight();
    }

    if (items[pointOfControlIndex]) {
      this._max.volume = items[pointOfControlIndex].volume._value || 0;

      if (poc)
        items[pointOfControlIndex].volume.changeStatus('pointOfControl');
    }

  }

  private _calculateLevels() {
    if (this._clearInterval || !this._settings.general?.intervals?.momentumTails)
      return;

    const _interval = setInterval(() => {
      this.detectChanges();

      let needStop = true;

      for (const item of this.items) {
        if (item.calculateLevel())
          needStop = false;
      }

      if (needStop && this._clearInterval)
        this._clearInterval();

    }, this._levelsInterval);

    this._clearInterval = () => {
      clearInterval(_interval);
      this._clearInterval = null;
    };
  }

  fillData(lastPrice: number) {
    if (isNaN(lastPrice) || lastPrice == null && !this.dataGrid?.isInitialized)
      return;

    this.items = [];
    this._map.clear();
    this._max.clear();
    const data = this.items;
    const tickSize = this._tickSize;

    let price = this._normalizePrice(lastPrice - tickSize * ROWS / 2);
    let index = -1;

    while (index++ < ROWS) {
      price = this._normalizePrice(price += tickSize);
      data.unshift(this._getItem(price, ROWS - index));
    }

    requestAnimationFrame(() => {
      this.refresh();
      this.centralize();
    });
  }

  private _applyOffset() {
    if (this._bestAskPrice)
      this._handleNewBestAsk();

    if (this._bestBidPrice)
      this._handleNewBestBid();
  }

  protected _handleQuote(trade: IQuote) {
    const item = this._getItem(trade.price);

    if (this._ttt++ > 1000) {
      console.log('_handleQuote', trade.side, Date.now() - trade.timestamp, trade.updateType, trade.price, trade.volume);
      this._ttt = 0;
    }

    const isBid = trade.side === QuoteSide.Bid;
    const size = (isBid ? item.bid._value : item.ask._value) ?? 0;

    const items = this.items;
    if (!items.length)
      this.fillData(trade.price);

    item.handleQuote(trade);

    if ((isBid && item.isBidSum) || (!isBid && item.isAskSum)) {
      return;
    }

    const max = this._max;
    const needRecalculate = trade.updateType === UpdateType.Undefined;
    const needClear = trade.volume === 0;
    const price = trade.price;

    if (isBid) {
      if (item.bid.visible) {
        if (!needRecalculate) {
          if (max.bid === size) {
            this._calculateBidHist(true);
          } else if (max.bid < item.bid.size) {
            max.bid = item.bid.size;
            this._calculateBidHist();
          }
        } else {
          this._bestBidPrice = price;
        }
        if (this.bidSumItem.lastPrice !== trade.price)
          this.bidSumItem.setBidSum(this.bidSumItem.bid._value - size + (item.bid._value ?? 0));
      }
    } else {
      if (item.ask.visible) {
        if (!needRecalculate) {
          if (max.ask === size) {
            this._calculateAskHist(true);
          } else if (max.ask < item.ask.size) {
            max.ask = item.ask.size;
            this._calculateAskHist();
          }
        } else {
          this._bestAskPrice = price;
        }
        if (this.askSumItem.lastPrice !== trade.price)
          this.askSumItem.setAskSum(this.askSumItem.ask._value - size + (item.ask._value ?? 0));
      }
    }

    if (needRecalculate) {
      const price = trade.price;

      if (isBid || (needClear && !isBid)) {
        // if (this._bestBidPrice !== price || needClear) {
        // if (!needClear)
        //   this._bestBidPrice = price;
        this._bestBidPrice = price;
        window.lastFn(this._handleNewBestBid);
        // this._handleNewBestBid(price);
        // }
      } else if (!isBid || (needClear && isBid)) {
        // if (this._bestAskPrice !== price || needClear) {
        // if (!needClear)
        //   this._bestAskPrice = price;
        this._bestAskPrice = price;
        window.lastFn(this._handleNewBestAsk);
        // this._handleNewBestAsk(price);
        // }
      }
    }

    this.detectChanges();
  }

  recalculateMax() {
    this._calculateAskHist(true);
    this._calculateBidHist(true);
  }

  _calculateAskHist(recalculateMax = false) {
    const items = this.items;
    const max = this._max;
    const startIndex = this._getItem(this._bestAskPrice).index;

    if (recalculateMax) {
      let _max = 0;
      let index = startIndex;
      let _item = items[index];

      while (_item && _item.ask.visible && !_item.isAskSum) {
        if (_item.ask._value > _max)
          _max = _item.ask._value;

        _item = items[--index];
      }

      if (max.ask === _max)
        return;

      max.ask = _max;
    }

    let index = this._getItem(this._bestAskPrice).index;
    let _item = items[index];

    while (_item && _item.ask.visible && !_item.isAskSum) {
      _item.ask.calcHist(max.ask);
      _item = items[--index];
    }
  }

  _calculateBidHist(recalculateMax = false) {
    const items = this.items;
    const max = this._max;
    const startIndex = this._getItem(this._bestBidPrice).index;

    if (recalculateMax) {
      let _max = 0;
      let index = startIndex;
      let _item = items[index];

      while (_item && _item.bid.visible && !_item.isBidSum) {
        if (_item.bid._value > _max)
          _max = _item.bid._value;
        _item = items[++index];
      }

      if (max.bid === _max)
        return;

      max.bid = _max;
    }

    let index = startIndex;
    let _item = items[index];

    while (_item && _item.bid.visible && !_item.isBidSum) {
      _item.bid.calcHist(max.bid);
      _item = items[++index];
    }
  }

  _handleNewBestBid = () => {
    const items = this.items;
    const marketDepth = this._marketDepth;
    const marketDeltaDepth = this._marketDeltaDepth;

    this.bidSumItem.clearBidSum();
    const price = this._bestBidPrice;
    let item = this._getItem(price);
    let index = item.index;
    const lastMarketDepthIndex = index + marketDepth;
    const lastMarketDeltaDepthIndex = index + marketDeltaDepth;
    let sum = 0;
    let max = 0;
    let rIndex = this.currentBidRange.minIndex;
    while (rIndex <= this.currentBidRange.maxIndex) {
      items[rIndex]?.setBidVisibility(true, true);
      if (rIndex !== index)
        items[rIndex]?.clearCurrentBidBest();
      items[rIndex]?.clearBidDelta();
      rIndex++;
    }

    while (item) {
      item.side = QuoteSide.Bid;

      if (item.lastPrice !== price) {
        item.clearBidDelta();
        item.clearCurrentBidBest();
      }

      const isVisible = lastMarketDepthIndex > item.index;
      const isDeltaVisible = lastMarketDeltaDepthIndex > item.index;
      // provide bad begaviour
      // if (!item.isBidSideVisible && !isVisible && !isDeltaVisible)
      //   break;

      item.setBidVisibility(!isVisible, !isDeltaVisible);

      if (isVisible) {
        if (item.bid._value > max) {
          max = item.bid._value;
        }

        sum += (item.bid._value ?? 0);
      }

      item = items[++index];
    }

    this._max.bid = max;

    if (items[lastMarketDepthIndex]) {
      this.bidSumItem = items[lastMarketDepthIndex];
      this.bidSumItem.setBidSum(sum);
    }

    this._getItem(price).bidDelta.changeStatus(CellStatus.Highlight);

    this._calculateBidHist();
  }

  _handleNewBestAsk = () => {
    const items = this.items;
    const marketDepth = this._marketDepth;
    const marketDeltaDepth = this._marketDeltaDepth;

    this.askSumItem.clearAskSum();

    const price = this._bestAskPrice;

    let item = this._getItem(price);
    let index = item.index;
    const lastMarketDepthIndex = index - marketDepth;
    const lastMarketDeltaDepthIndex = index - marketDeltaDepth;
    let sum = 0;
    let max = 0;
    let rIndex = this.currentAskRange.minIndex;
    while (rIndex <= this.currentAskRange.maxIndex) {
      items[rIndex]?.setAskVisibility(true, true);
      if (index !== rIndex)
        items[rIndex]?.clearCurrentAskBest();
      items[rIndex]?.clearAskDelta();
      rIndex++;
    }

    while (item) {
      item.side = QuoteSide.Ask;

      if (item.lastPrice !== price) {
        item.clearAskDelta();
        item.clearCurrentAskBest();
      }

      const isVisible = lastMarketDepthIndex < item.index;
      const isDeltaVisible = lastMarketDeltaDepthIndex < item.index;
      // if (!item.isAskSideVisible && !isVisible && !isDeltaVisible)
      //   break;

      item.setAskVisibility(!isVisible, !isDeltaVisible);

      if (isVisible) {
        if (item.ask._value > max) {
          max = item.ask._value;
        }

        sum += (item.ask._value ?? 0);
      }

      item = items[--index];
    }

    this._max.ask = max;

    if (items[lastMarketDepthIndex]) {
      this.askSumItem = items[lastMarketDepthIndex];
      this.askSumItem.setAskSum(sum);
    }

    this._getItem(price).askDelta.changeStatus(CellStatus.Highlight);

    this._calculateAskHist();
  }

  afterDraw = (e, grid) => {
    const ctx = e.ctx;
    let fn;

    const centerLineEnabled = this._settings.general?.commonView?.centerLine;
    const lastItemIndex = this.items.length - 1;
    const volumeColumn = grid.schema.find(item => item.name == DOMColumns.Volume);

    const enableEth = this._settings.volume.sessions.histogramEnabled;
    let x;

    if (enableEth)
      grid.forEachColumn((column, columnX) => {
        if (column.name == DOMColumns.Volume)
          x = columnX;
      });

    const showColumnHeaders = grid.attributes.showColumnHeaders;
    const headerHeight = grid.attributes.showColumnHeaders ? (grid.style.headerHeight || grid.style.rowHeight) : 0;
    const height = grid.style.rowHeight + grid.style.rowOffset;
    ctx.beginPath();
    ctx.save();

    grid.forEachRow((row, y) => {
      if (enableEth && (!showColumnHeaders || y >= headerHeight))
        this.drawVolumeEth({row, lastItemIndex, ctx, height, y, volumeColumn, x});

      if (centerLineEnabled && row.isCenter) {
        fn = () => {
          const width = e.ctx.canvas.width;
          const rowHeight = grid.style.rowHeight;
          y += rowHeight;

          ctx.beginPath();
          ctx.strokeStyle = this._settings.common?.generalColors?.centerLineColor;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        };
      }
    });
    ctx.stroke();
    ctx.restore();

    if (fn)
      fn();
  }

  private drawVolumeEth({row, lastItemIndex, ctx, height, y, volumeColumn, x}) {
    const index = row.index;
    let prevVolume;
    if (index !== 0)
      prevVolume = this.items[index - 1].volume;

    let nextVolume;
    if (index !== lastItemIndex)
      nextVolume = this.items[index + 1].volume;

    VolumeCell.drawETH(ctx, row.volume, prevVolume, nextVolume, height, y, volumeColumn.width, x);
  }

  transformAccountLabel(label: string) {
    const replacer = '*';
    const {hideAccountName, hideFromLeft, hideFromRight, digitsToHide} = this._settings.general;
    if (hideAccountName) {
      const length = digitsToHide > label.length ? label.length : digitsToHide;
      let _label = label;
      if (hideFromLeft)
        _label = replacer.repeat(length) + _label.substring(length, label.length);
      if (hideFromRight)
        _label = _label.substring(0, label.length - length) + replacer.repeat(length);
      return _label;
    }
    return label;
  }

  private _closeSettings() {
    this.broadcastData(DomSettingsSelector, {action: 'close', linkKey: this._getSettingsKey()} as IDomSettingsEvent);
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
        break;
      case LayoutNodeEvent.Event:
        return this._handleKey(data);
    }
    return false;
  }

  private _handleKey(event) {
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    this.keysStack.handle(event);
    const keyBinding = Object.entries(this._settings.hotkeys)
      .filter(([name, item]) => item)
      .map(([name, item]) => [name, KeyBinding.fromDTO(item as any)])
      .find(([name, binding]) => (binding as KeyBinding).equals(this.keysStack));

    if (keyBinding) {
      console.warn(keyBinding[0]);
      this.domKeyHandlers[keyBinding[0] as string]();
      this.detectChanges(true);
      return true;
    }
  }

  handleChangeFormPosition(position: FormDirection): void {
    this.currentDirection = position;
    this._validateComponentWidth();
  }

  onResize(): void {
    this._validateComponentWidth();
  }

  onColumnResize(data): void {
    this._validateComponentWidth();
  }

  private _validateComponentWidth(): void {
    if (!this.dataGrid || !this.dataGrid.isInitialized)
      return;

    const currentGridWidth = this.dataGrid.tableContainer.nativeElement.offsetWidth;
    const minGridWidth = Math.floor(this.dataGrid.scrollWidth);
    const window = this._windowManagerService.getWindowByComponent(this);
    if (!window)
      return;

    const minWindowWidth = minGridWidth + (window._container.offsetWidth - currentGridWidth);
    window.options.minWidth = minWindowWidth;

    if (minGridWidth > currentGridWidth) {
      window.width = minWindowWidth;
    }
    this.dataGrid.resize();
  }

  toggleTrading(): void {
    if (!this.isTradingEnabled) {
      this._tradeHandler.enableTrading();
    } else {
      this.isTradingEnabled = false;
      this._tradeHandler.showDisableTradingAlert();
    }
  }

  private _handleResize(afterResize?: Function) {
    this.visibleRows = this.dataGrid.getVisibleRows();

    this.dataGrid.resize();
    if (afterResize)
      afterResize();
  }

  saveState(): IDomState {
    return {
      instrument: this.instrument,
      componentInstanceId: this.componentInstanceId,
      settings: this._settings.toJson(),
      ...this.dataGrid.saveState(),
      link: this.link,
      orderForm: this.domForm?.getState()
    };
  }

  loadState(state: IDomState) {
    this._settings = state?.settings ? DomSettings.fromJson(state.settings) : new DomSettings();
    this._linkSettings(this._settings);
    if (state?.componentInstanceId)
      this.componentInstanceId = state.componentInstanceId;
    if (state?.columns)
      this.columns = state.columns;
    this._settings.columns = this.columns;
    // for debug purposes
    if (state && state.contextMenuState) {
      this.dataGridMenuState = state.contextMenuState;
    }

    if (!state)
      state = {} as any;

    if (state.link != null) {
      this.link = state.link;
    }

    if (state.account) {
      this.account = state.account;
    }

    if (!state?.instrument)
      state.instrument = {
        id: 'ESM2.CME',
        description: 'E-Mini S&P 500 Jun22',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        instrumentTimePeriod: 'Jun22',
        contractSize: 50,
        productCode: 'ES',
        symbol: 'ESM2',
      };
    // for debug purposes

    this._observe();
    this.refresh();

    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
    this._initialState = state;
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
          name: DomSettingsSelector,
          state: { settings: this._settings, linkKey: this._getSettingsKey() },
        },
        closeBtn: true,
        single: false,
        width: 618,
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

  private _createOrder(side: OrderSide, price?: number, orderConfig: Partial<IOrder> = {}, event?) {
    if (!this.isTradingEnabled) {
      this.notifier.showError('You can\'t create order when trading is locked');
      return;
    }

    if (!this._domForm.valid) {
      this.notifier.showError('Please fill all required fields in form');
      return;
    }
    const form = this._domForm.getDto();
    const { exchange, symbol } = this.instrument;
    const priceSpecs = this._getPriceSpecs({ ...form, side }, price);
    const order = {
      ...form,
      ...priceSpecs,
      ...orderConfig,
      exchange,
      side,
      symbol,
      accountId: this.accountId,
    };
    if (this.showOrderConfirm) {
      this.createConfirmModal({
        order,
        instrument: this.instrument,
      }, event).afterClose
        .pipe(untilDestroyed(this))
        .subscribe((res) => {
          if (res) {
            if (res.create)
              this.__createOrder(order);

            this.showOrderConfirm = !res.dontShowAgain;
          }
        });
    } else
      this.__createOrder(order);
  }

  private __createOrder(order) {
    this._ordersRepository.createItem(order).pipe(untilDestroyed(this))
      .subscribe(
        (res) => console.log('Order successfully created'),
        (err) => this.notifier.showError(err)
      );
  }

  private createConfirmModal(params, event) {
    const nzStyle = event ? {
      left: `${event.screenX - (confirmModalWidth / 2)}px`,
      top: `${event.screenY - (confirmModalHeight / 2)}px`,
    } : {};
    return this._modalService.create({
      nzClassName: 'confirm-order',
      nzIconType: null,
      nzContent: ConfirmOrderComponent,
      nzFooter: null,
      nzNoAnimation: true,
      nzStyle,
      nzComponentParams: params
    });
  }

  private _createOrderByClick(column: string, item: DomItem, event) {
    const side = column === DOMColumns.Ask ? OrderSide.Sell : OrderSide.Buy;
    if (this.ocoStep === OcoStep.None) {
      this._createOrder(side, item.price._value, {}, event);
    } else {
      if (this.showOrderConfirm) {
        this.createConfirmModal({
          instrument: this.instrument,
          order: { ...this.domForm.getDto(), side, price: item.lastPrice },
        }, event).afterClose
          .pipe(untilDestroyed(this))
          .subscribe((res) => {
            if (res) {
              if (res.create)
                this._addOcoOrder(side, item);
              this.showOrderConfirm = !res.dontShowAgain;
            }
          });
      } else
        this._addOcoOrder(side, item);
    }
  }

  private _addOcoOrder(side, item: DomItem) {
    if (!this.firstOcoOrder) {
      this.firstOcoOrder = this._createOCOOrder(item, side);
      this._createOcoOrder();
    } else if (!this.secondOcoOrder) {
      this.secondOcoOrder = this._createOCOOrder(item, side);
      this._createOcoOrder();
    }
  }

  private _createOCOOrder(item: DomItem, side) {
    item.createOcoOrder(side, this._domForm.getDto());
    const order = { ...this._domForm.getDto(), side };
    const specs = this._getPriceSpecs(order, +item.price.value);
    return { ...order, ...specs };
  }

  private _getPriceSpecs(item: IOrder & { amount: number }, price) {
    return getPriceSpecs(item, price, this._tickSize);
  }

  private _createOcoOrder() {
    this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
    if (this.firstOcoOrder && this.secondOcoOrder) {
      this.firstOcoOrder.ocoOrder = this.secondOcoOrder;
      this.firstOcoOrder.accountId = this.accountId;
      this.firstOcoOrder.ocoOrder.accountId = this.accountId;
      this._ordersRepository.createItem(this.firstOcoOrder)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this._clearOcoOrders();
        });
    }
  }

  private _cancelOrderByClick(column: string, item: DomItem, event) {
    if (!item[column]?.canCancelOrder)
      return;

    if (this.showCancelConfirm) {
      this.createConfirmModal({
        order: item.orders.order,
        instrument: this.instrument,
        prefix: 'Cancel'
      }, event).afterClose.toPromise().then((res) => {
        if (!res)
          return;

        const { create, dontShowAgain } = res;
        this.showCancelConfirm = !dontShowAgain;
        if (!create)
          return;

        this.__cancelOrderByClick(column, item);
      });
    } else {
      this.__cancelOrderByClick(column, item);
    }
  }

  private __cancelOrderByClick(column: string, item: DomItem) {
    if (!item[column]?.canCancelOrder)
      return;

    let side = null;
    let filter = (order) => true;

    switch (column) {
      case DOMColumns.BidDelta:
      case DOMColumns.BuyOrders:
        side = QuoteSide.Ask;
        filter = (order) => order.side === OrderSide.Buy;
        break;
      case DOMColumns.AskDelta:
      case DOMColumns.SellOrders:
        side = QuoteSide.Bid;
        filter = (order) => order.side === OrderSide.Sell;
        break;
    }

    this._clearOcoOrders(side);
    const orders = (item.orders?.orders ?? []).filter(filter);

    if (orders.length)
      this._ordersRepository.deleteMany(orders)
        .pipe(untilDestroyed(this))
        .subscribe(
          () => console.log('delete order'),
          (error) => this.notifier.showError(error),
        );
  }

  handleFormAction(action: FormActions, event?) {
    switch (action) {
      case FormActions.CloseOrders:
      case FormActions.CloseBuyOrders:
      case FormActions.CloseSellOrders:
        this._closeOrders(action);
        break;
      case FormActions.ClosePositions:
        this._closePositions();
        break;
      case FormActions.Flatten:
        this._closeOrders(FormActions.CloseOrders);
        this._closePositions();
        break;
      case FormActions.CreateOcoOrder:
        if (this.ocoStep === OcoStep.None)
          this.ocoStep = OcoStep.Fist;
        break;
      case FormActions.CancelOcoOrder:
        this._clearOcoOrders();
        break;
      case FormActions.CreateSellMarketOrder:
        this._createSellMarketOrder(event);
        break;
      case FormActions.CreateBuyMarketOrder:
        this._createBuyMarketOrder(event);
        break;
      default:

        console.error('Undefined action');
    }
  }

  _clearOcoOrders(side?: QuoteSide) {
    if (this.items.every(item => item.clearOcoOrder(side) !== false)) {
      this.ocoStep = OcoStep.None;
      this.secondOcoOrder = null;
      this.firstOcoOrder = null;
    }
  }

  _createBuyMarketOrder(event?) {
    this._createOrder(OrderSide.Buy, null, { type: OrderType.Market }, event);
  }

  _createSellMarketOrder(event?) {
    this._createOrder(OrderSide.Sell, null, { type: OrderType.Market }, event);
  }

  private _closePositions() {
    this._positionsRepository.deleteMany({
      accountId: this.accountId,
      ...this._instrument,
    }).pipe(untilDestroyed(this))
      .subscribe(
        () => console.log('_closePositions'),
        (error) => this.notifier.showError(error),
      );
  }

  private _closeOrders(action: FormActions) {
    let orders = [...this.orders];

    if (action === FormActions.CloseSellOrders)
      orders = orders.filter(i => i.side === OrderSide.Sell);
    else if (action === FormActions.CloseBuyOrders)
      orders = orders.filter(i => i.side === OrderSide.Buy);

    this._ordersRepository.deleteMany(orders)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => console.log('delete many'),
        (error) => this.notifier.showError(error),
      );
  }

  private _normalizePrice(price) {
    const tickSize = this._tickSize;
    return +(Math.round(price / tickSize) * tickSize).toFixed(this.instrument?.precision);
  }

  private _handleQuantitySelect(position: number): void {
    this._domForm.selectQuantityByPosition(position);
  }

  private _getNavbarTitle(): string {
    if (this.instrument) {
      return `${this.instrument.symbol} - ${this.instrument.description}`;
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._clearInterval)
      this._clearInterval();

    const instrument = this.instrument;
    if (!instrument)
      return;

    this.unsubscribe();
  }

  onCurrentCellChanged(event: ICellChangedEvent<DomItem>) {
    this.currentRow = event.row;
  }

  onColumnUpdate(column: Column) {
    const hasCommonSettings = this._settings.common.hasOwnProperty(column.name);
    if (hasCommonSettings) {
      this._settings.common[column.name] = column.visible;
    }
    const hasSettings = this._settings.hasOwnProperty(column.name);
    if (hasSettings) {
      this._settings[column.name].textAlign = column.style.textAlign;
    }
    if (DOMColumns.AskDelta === column.name) {
      const delta = this.columns.find((item) => item.name === DOMColumns.Delta);
      delta.style.askDeltahighlightTextAlign = column.style.textAlign;
    }
    if (DOMColumns.BidDelta === column.name) {
      const delta = this.columns.find((item) => item.name === DOMColumns.Delta);
      delta.style.bidDeltahighlightTextAlign = column.style.textAlign;
    }

    this.broadcastData(receiveSettingsKey + this._getSettingsKey(), this._settings);
  }
}

export function sum(num1, num2, step = 1) {
  step = Math.pow(10, step);
  return (Math.round(num1 * step) + Math.round(num2 * step)) / step;
}

function extractStyles(settings: any, status: string) {
  const obj = {};

  for (const key in settings) {
    if (!key.includes(status))
      continue;

    const newKey = key.replace(status, '');
    if (isStartFromUpperCase(newKey)) {// for example BackgroundColor, Color
      obj[newKey] = settings[key];
    }
  }

  return obj;
}

function isStartFromUpperCase(key) {
  return /[A-Z]/.test((key ?? '')[0]);
}


export function calculatePL(position: IPosition, price: number, tickSize: number, contractSize: number, includeRealizedPL = false): number {
  if (!position || position.side === Side.Closed)
    return null;

  const priceDiff = position.side === Side.Short ? position.price - price : price - position.price;
  let pl = position.size * (tickSize * contractSize * (priceDiff / tickSize));
  if (includeRealizedPL) {
    pl += position.realized;
  }

  return pl;
}

export function calculateDay(date, dayOfWeek) {
  const currentDay = date.getDay();
  const distance = dayOfWeek - currentDay;
  return date.getDate() + distance;
}

function mapSettingsToSideFormState(settings: DomSettings): SideOrderSettingsDom {

  const orderAreaSettings = settings.trading.orderArea.settings;
  const sideOrderSettingsDom: SideOrderSettingsDom = {};
  sideOrderSettingsDom.buyButtonsBackgroundColor = orderAreaSettings.buyMarketButton.background;
  sideOrderSettingsDom.buyButtonsFontColor = orderAreaSettings.buyMarketButton.font;

  sideOrderSettingsDom.sellButtonsBackgroundColor = orderAreaSettings.sellMarketButton.background;
  sideOrderSettingsDom.sellButtonsFontColor = orderAreaSettings.sellMarketButton.font;

  sideOrderSettingsDom.flatButtonsBackgroundColor = orderAreaSettings.flatten.background;
  sideOrderSettingsDom.flatButtonsFontColor = orderAreaSettings.flatten.font;

  sideOrderSettingsDom.cancelButtonBackgroundColor = orderAreaSettings.cancelButton.background;
  sideOrderSettingsDom.cancelButtonFontColor = orderAreaSettings.cancelButton.font;

  sideOrderSettingsDom.closePositionFontColor = orderAreaSettings.showLiquidateButton?.font;
  sideOrderSettingsDom.closePositionBackgroundColor = orderAreaSettings.showLiquidateButton?.background;

  sideOrderSettingsDom.icebergFontColor = orderAreaSettings.icebergButton.font;
  sideOrderSettingsDom.icebergBackgroundColor = orderAreaSettings.icebergButton.background;

  sideOrderSettingsDom.formSettings = {};
  sideOrderSettingsDom.formSettings.showIcebergButton = orderAreaSettings.icebergButton.enabled;
  sideOrderSettingsDom.formSettings.showFlattenButton = orderAreaSettings.flatten.enabled;
  sideOrderSettingsDom.formSettings.showLiquidateButton = orderAreaSettings.showLiquidateButton?.enabled;
  sideOrderSettingsDom.formSettings.showCancelButton = orderAreaSettings.cancelButton.enabled;
  sideOrderSettingsDom.formSettings.showBuyButton = orderAreaSettings.buyMarketButton.enabled;
  sideOrderSettingsDom.formSettings.showSellButton = orderAreaSettings.sellMarketButton.enabled;
  sideOrderSettingsDom.formSettings.showBracket = settings.trading.orderArea.bracketButton;
  sideOrderSettingsDom.formSettings.showInstrumentChange = settings.trading.orderArea.showInstrumentChange;
  sideOrderSettingsDom.formSettings.showOHLVInfo = settings.trading.orderArea.showOHLVInfo;
  sideOrderSettingsDom.formSettings.showPLInfo = settings.trading.orderArea.showPLInfo;
  sideOrderSettingsDom.formSettings.roundPL = settings.trading.orderArea.roundPL;
  sideOrderSettingsDom.formSettings.showCancelConfirm = settings.trading.trading.showCancelConfirm;
  sideOrderSettingsDom.formSettings.showOrderConfirm = settings.trading.trading.showOrderConfirm;
  sideOrderSettingsDom.formSettings.includeRealizedPL = settings.trading.orderArea.includeRealizedPL;
  sideOrderSettingsDom.amountButtons = settings.trading.amountButtons;
  sideOrderSettingsDom.tif = settings.trading.tif;

  return sideOrderSettingsDom;
}
