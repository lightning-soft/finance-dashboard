import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  OnInit,
  ViewChild
} from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { convertToColumn, HeaderItem, LoadingComponent } from 'base-components';
import {
  FormActions,
  getPriceSpecs,
  OcoStep,
  SideOrderForm,
  SideOrderFormComponent
} from 'base-order-form';
import { Id, RealtimeActionData } from 'communication';
import {
  Cell,
  CellClickDataGridHandler,
  CellStatus,
  Column, ContextMenuClickDataGridHandler,
  DataGrid, DataGridHandler,
  ICellChangedEvent, IFormatter, MouseDownDataGridHandler, MouseUpDataGridHandler,
  RoundFormatter
} from 'data-grid';
import { environment } from 'environment';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { IHistoryItem, RealPositionsRepository } from 'real-trading';
import {
  compareInstruments,
  IConnection,
  IInstrument,
  IOrder,
  getPrice,
  IPosition,
  IQuote,
  Level1DataFeed, OHLVFeed, OrderBooksRepository,
  OrdersFeed,
  OrderSide,
  OrdersRepository,
  OrderStatus,
  OrderType, isForbiddenOrder,
  PositionsFeed,
  PositionsRepository,
  QuoteSide,
  Side, TradeDataFeed,
  TradePrint, UpdateType, VolumeHistoryRepository, roundToTickSize
} from 'trading';
import { IWindow, WindowManagerService } from 'window-manager';
import { DomSettingsSelector, IDomSettingsEvent, receiveSettingsKey } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { SettingTab } from './dom-settings/settings-fields';
import { CustomDomItem, DomItem, LEVELS, SumStatus, TailInside, VolumeStatus } from './dom.item';
import { HistogramCell } from './histogram/histogram.cell';
import { OpenPositionStatus, openPositionSuffix } from './price.cell';
import { finalize } from "rxjs/operators";
import { TradeHandler } from "src/app/components";

export interface DomComponent extends ILayoutNode, LoadingComponent<any, any> {
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

const ROWS = 400;
const DOM_HOTKEYS = 'domHotkeys';

interface IDomState {
  instrument: IInstrument;
  settings?: any;
  componentInstanceId: number;
  columns: any;
  contextMenuState: any;
  orderForm: Partial<SideOrderForm>;
  link: string | number;
}

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

enum Columns {
  ID = '_id',
  LTQ = 'ltq',
  Bid = 'bid',
  Ask = 'ask',
  CurrentBid = 'currentBid',
  CurrentAsk = 'currentAsk',
  Delta = 'delta',
  AskDelta = 'askDelta',
  BidDelta = 'bidDelta',
  Orders = 'orders',
  SellOrders = 'sellOrders',
  BuyOrders = 'buyOrders',
  Volume = 'volume',
  TotalBid = 'totalBid',
  TotalAsk = 'totalAsk',
  Price = 'price',
}

const headers: HeaderItem[] = [
  { name: Columns.Orders, tableViewName: 'Orders' },
  { name: Columns.BuyOrders, title: 'buy Orders', tableViewName: 'Buy Orders' },
  { name: Columns.SellOrders, title: 'sell Orders', tableViewName: 'Sell Orders' },
  { name: Columns.Volume, tableViewName: 'Volume', type: 'histogram' },
  Columns.Price,
  { name: Columns.Delta, tableViewName: 'Delta' },
  { name: Columns.BidDelta, title: 'delta', tableViewName: 'Bid Delta' },
  { name: Columns.Bid, tableViewName: 'Bid', type: 'histogram' },
  { name: Columns.LTQ, tableViewName: 'LTQ' },
  { name: Columns.CurrentBid, title: 'c.bid', tableViewName: 'C.Bid', type: 'histogram' },
  { name: Columns.CurrentAsk, title: 'c.ask', tableViewName: 'C.Ask', type: 'histogram' },
  { name: Columns.Ask, title: 'ask', tableViewName: 'Ask', type: 'histogram' },
  { name: Columns.AskDelta, title: 'delta', tableViewName: 'Ask Delta' },
  { name: Columns.TotalBid, title: 't.bid', tableViewName: 'T.Bid', type: 'histogram' },
  { name: Columns.TotalAsk, title: 't.ask', tableViewName: 'T.Ask', type: 'histogram' },
];

export enum QuantityPositions {
  FIRST = 0,
  SECOND = 2,
  THIRD = 3,
  FORTH = 4,
  FIFTH = 5,
}

const OrderColumns: string[] = [Columns.AskDelta, Columns.BidDelta, Columns.Orders, Columns.Delta, Columns.BuyOrders, Columns.SellOrders];

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
  styleUrls: ['./dom.component.scss'],
})
@LayoutNode()
export class DomComponent extends LoadingComponent<any, any> implements OnInit, AfterViewInit, IStateProvider<IDomState> {
  @ViewChild('domForm') domForm: SideOrderFormComponent;

  get accountId() {
    return this._accountId;
  }

  public get instrument(): IInstrument {
    return this._instrument;
  }

  public set instrument(value: IInstrument) {
    if (compareInstruments(this._instrument, value))
      return;

    const prevInstrument = this._instrument;
    this._unsubscribeFromInstrument();

    this._instrument = value;
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

  private _lastTradeItem: DomItem;

  private get _lastPrice(): number {
    return this._lastTradeItem?.lastPrice;
  }

  get trade() {
    return this._lastTrade;
  }

  get domFormSettings() {
    return this._settings.orderArea;
  }

  get _tickSize() {
    return this.instrument?.tickSize ?? 0.25;
  }

  orders: IOrder[] = [];

  askSumItem: DomItem;
  bidSumItem: DomItem;

  _lastAskItem: DomItem;
  _lastBidItem: DomItem;

  private _marketDepth = 9;
  private _marketDeltaDepth = 9;

  handleLinkData( {instrument} ) {
    if (instrument)
      this.instrument = instrument;
  }

  constructor(
    private _ordersRepository: OrdersRepository,
    private _positionsRepository: PositionsRepository,
    private _orderBooksRepository: OrderBooksRepository,
    private _ordersFeed: OrdersFeed,
    private _positionsFeed: PositionsFeed,
    private _levelOneDatafeed: Level1DataFeed,
    private _tradeDatafeed: TradeDataFeed,
    protected _accountsManager: AccountsManager,
    private _volumeHistoryRepository: VolumeHistoryRepository,
    protected _injector: Injector,
    private _ohlvFeed: OHLVFeed,
    private _windowManagerService: WindowManagerService,
    private _tradeHandler: TradeHandler,
    protected _changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this.componentInstanceId = Date.now();
    this.setTabIcon('icon-widget-dom');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    (window as any).dom = this;

    setInterval(() => {
      console.log(this._counter);
      this._counter = 0;
    }, 1000 * 60);

    this.askSumItem = this._getItem(null);
    this.bidSumItem = this._getItem(null);
    this._lastAskItem = this._getItem(null);
    this._lastBidItem = this._getItem(null);
    this._lastTradeItem = this._getItem(null);

    this.columns = headers.map(convertToColumn);

    if (!environment.production) {
      this.columns.unshift(convertToColumn('_id'));
    }
  }

  columns: Column[] = [];
  keysStack: KeyboardListener = new KeyboardListener();
  buyOcoOrder: IOrder;
  sellOcoOrder: IOrder;
  ocoStep = OcoStep.None;
  position: IPosition;
  orderFormState: Partial<SideOrderForm>;
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
          this._cancelOrderByClick(data.column.name, data.item);
        }
      }
    }),
    new CellClickDataGridHandler<DomItem>({
      column: [Columns.Ask, Columns.Bid],
      handler: (data) => this._createOrderByClick(data.column.name, data.item),
    }),
    new MouseDownDataGridHandler<DomItem>({
      column: OrderColumns,
      handler: (data) => {
        const orders = data.item.orders.orders;
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

  private _accountId: string;
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

  isFormOpen = true;
  bracketActive = true;
  isExtended = true;

  private _instrument: IInstrument;
  private _priceFormatter: IFormatter;

  visibleRows = 0;

  private _max = new DomItemMax();
  // private _lastChangesItem: { [key: string]: DomItem } = {};

  private _map = new Map<number, DomItem>();

  private _lastTrade: TradePrint;

  private _settings: DomSettings = new DomSettings();

  private _bestBidPrice: number;
  private _bestAskPrice: number;
  componentInstanceId: number;

  dailyInfo: Partial<IHistoryItem>;

  private _counter = 0;
  showColumnTitleOnHover = (item: Column) => false;

  get isTradingLocked(): boolean {
    return !this._tradeHandler.isTradingEnabled$.value;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._accountsManager.activeConnection
      .pipe(untilDestroyed(this))
      .subscribe((connection) => {
        this._ordersRepository = this._ordersRepository.forConnection(connection);
        this._positionsRepository = this._positionsRepository.forConnection(connection);
        this._orderBooksRepository = this._orderBooksRepository.forConnection(connection);
        this._volumeHistoryRepository = this._volumeHistoryRepository.forConnection(connection);
        if (connection)
          this._onInstrumentChange(this.instrument);
      });

    this._ordersRepository.actions
      .pipe(untilDestroyed(this))
      .subscribe((action) => this._handleOrdersRealtime(action));

    this.onRemove(
      this._levelOneDatafeed.on((item: IQuote) => this._handleQuote(item)),
      this._tradeDatafeed.on((item: TradePrint) => this._handleTrade(item)),
      this._ordersFeed.on((trade: IOrder) => this._handleOrders([trade])),
      this._positionsFeed.on((pos) => this.handlePosition(pos)),
      this._ohlvFeed.on((ohlv) => this.handleOHLV(ohlv))
    );

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

  private _observe() {
    this.addLinkObserver({
      link: DOM_HOTKEYS,
      handleLinkData: (key: string) => this.handleHotkey(key),
    });
    this.addLinkObserver({
      link: this._getSettingsKey(),
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

    for (const key of [Columns.CurrentAsk, Columns.CurrentBid]) {
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

    const deltaStyles = {};
    for (const key of [Columns.BidDelta, Columns.AskDelta]) {
      const obj = settings[key];
      if (!obj)
        continue;

      for (const _key in obj) {
        if (obj.hasOwnProperty(_key)) {
          deltaStyles[`${ key }${ _key }`] = obj[_key];
          deltaStyles[`${ key }${ capitalizeFirstLetter(_key) }`] = obj[_key];
        }
      }
    }

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

    const depth = settings.general?.marketDepth;
    this._marketDepth = depth?.marketDepth ?? 10000;
    this._marketDeltaDepth = depth?.bidAskDeltaDepth ?? 10000;


    // this._calculateDepth();
    this.refresh();
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
      i.index = index;
    });
    this._applyOffset();
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

  getPl(): string {
    const position = this.position;

    if (!position || position.side === Side.Closed) {
      return '-';
    }

    const includeRealizedPl = this.domFormSettings.formSettings.includeRealizedPL;
    const price = this._lastTradeItem.price._value ?? 0;
    const i = this.instrument;
    const precision = this.domFormSettings.formSettings.roundPL ? 0 : (i?.precision ?? 2);

    return calculatePL(position, price, this._tickSize, i?.contractSize, includeRealizedPl).toFixed(precision);
  }

  _setPriceForOrders(orders: IOrder[], price: number) {
    const amount = this.domForm.getDto().amount;

    orders.map(item => {
      item.amount = amount;
      const priceTypes = this._getPriceSpecs(<IOrder & { amount: number }>item, price);

      return {
        quantity: item.quantity,
        type: item.type,
        ...priceTypes,
        duration: item.duration,
        id: item.id,
        account: item.account,
        accountId: item.account.id,
        instrument: item.instrument,
        symbol: item.instrument.symbol,
        exchange: item.instrument.exchange,
      };
    }).forEach(item => this._ordersRepository.updateItem(item).toPromise());
  }

  // #TODO need test
  private _createOrderByCurrent(side: OrderSide, price: number) {
    if (price)
      this._createOrder(side, +price);
  }

  handleHotkey(key) {
    this.domKeyHandlers[key]();
  }

  handleOHLV(ohlv) {
    if (compareInstruments(this.instrument, ohlv.instrument))
      this.dailyInfo = { ...ohlv };
  }

  handlePosition(pos) {
    const newPosition: IPosition = RealPositionsRepository.transformPosition(pos);
    const oldPosition = this.position;

    if (compareInstruments(this.instrument, pos.instrument)) {
      if (oldPosition && oldPosition.side !== Side.Closed) {
        const oldItem = this._getItem(roundToTickSize(oldPosition.price, this._tickSize));
        oldItem.revertPriceStatus();
      }
      this._applyPositionSetting(oldPosition, newPosition);
      this.position = newPosition;
      this._applyPositionStatus();
    }
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
        calculatePL(position, i.price._value, this._tickSize, contractSize, ordersSettings.includePnl) : null;
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

  _handleOrdersRealtime(action: RealtimeActionData<IOrder>) {
    if (action.items)
      this._handleOrders(action.items);

    this.detectChanges();
  }

  _onInstrumentChange(prevInstrument: IInstrument) {
    const instrument = this.instrument;
    if (instrument?.id != null && instrument?.id !== prevInstrument?.id) {
      this.dailyInfo = null;
      this._levelOneDatafeed.subscribe(instrument);
      this._tradeDatafeed.subscribe(instrument);
    }
    this._priceFormatter = new RoundFormatter(instrument?.precision ?? 2);

    this._loadData();
  }

  _unsubscribeFromInstrument() {
    const instrument = this.instrument;
    if (instrument) {
      this._levelOneDatafeed.unsubscribe(instrument);
      this._tradeDatafeed.unsubscribe(instrument);
      this._ohlvFeed.unsubscribe(instrument);
    }
  }

  protected _loadVolumeHistory() {
    if (!this._accountId || !this._instrument)
      return;

    const { symbol, exchange } = this._instrument;
    this._volumeHistoryRepository.getItems({ symbol, exchange })
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          for (const vol of res.data) {
            const item = this._getItem(vol.price);
            item.setVolume(vol.volume);
          }

          this._updateVolumeColumn();
        },
        error => this.notifier.showError(error)
      );
  }

  protected _loadOrderBook() {
    if (!this._accountId || !this._instrument)
      return;

    const { symbol, exchange } = this._instrument;
    this._orderBooksRepository.getItems({ symbol, exchange })
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          this._clear();

          const { asks, bids } = res.data[0];

          bids.sort((a, b) => a.price - b.price);
          asks.sort((a, b) => b.price - a.price);

          if (asks.length || bids.length) {
            let index = 0;
            let price = this._normalizePrice(asks[asks.length - 1]?.price);
            const tickSize = this._tickSize;

            index = 0;
            price = this._normalizePrice(asks[asks.length - 1]?.price - tickSize);

            this.fillData(price);

            const instrument = this.instrument;
            asks.forEach((info) => this._handleQuote({
              instrument,
              price: info.price,
              timestamp: 0,
              volume: info.volume,
              side: QuoteSide.Ask
            } as IQuote));
            bids.forEach((info) => this._handleQuote({
              instrument,
              price: info.price,
              timestamp: 0,
              volume: info.volume,
              side: QuoteSide.Bid
            } as IQuote));

            for (const i of this.items) {
              i.clearDelta();
              i.dehighlight();
            }
          }

          this.refresh();
          this._fillPL();
          this._loadOrders();
          this._loadVolumeHistory();
        },
        error => this.notifier.showError(error)
      );
  }

  protected _loadOrders(): void {
    if (!this._accountId)
      return;

    this.orders = [];
    this._ordersRepository.getItems({ id: this._accountId })
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
      if (order.instrument.symbol !== this.instrument.symbol || order.instrument.exchange != this.instrument.exchange)
        continue;

      this.items.forEach(item => item.removeOrder(order));
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

  handleAccountChange(account: string) {
    this._accountId = account;
    this._loadData();
  }

  protected _loadData() {
    if (!this._accountId || !this._instrument)
      return;

    this._loadPositions();
    this._loadOrderBook();
    this.refresh();

    this._ohlvFeed.subscribe(this.instrument);
  }

  protected _loadPositions() {
    const hide = this.showLoading();
    this._positionsRepository.getItems({ accountId: this._accountId })
      .pipe(finalize(hide), untilDestroyed(this))
      .subscribe(items => {
        this.position = items.data.find(item => compareInstruments(item.instrument, this.instrument));
        this._applyPositionStatus();
        this._fillPL();
      });
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

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._ordersRepository = this._ordersRepository.forConnection(connection);
  }

  ngAfterViewInit() {
    this._handleResize();
    this.domForm.loadState(this.orderFormState);
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

  centralize() {
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
        const customItemData = {};
        const prices = [];

        for (let m = 0; m < multiplier; m++) {
          const price = this._normalizePrice(startPrice - (offset * multiplier + m) * tickSize);

          prices.push(price);
          customItemData[price] = map[price] ?? new DomItem(null, this._settings, this._priceFormatter, customItemData);
          const _item = customItemData[price];

          if (_item.ask.status === SumStatus) {
            _item.setAskSum(null);
          }
          if (_item.bid.status === SumStatus) {
            _item.setBidSum(null);
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
    this.detectChanges();
  }

  detectChanges(force = false) {
    if (!force && (this._updatedAt + this._upadateInterval) > Date.now())
      return;

    this.dataGrid.detectChanges(force);
    this._updatedAt = Date.now();
  }

  private _getItem(price: number, index?: number): DomItem {
    let item = this._map.get(price);
    if (!item) {
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
    if (trade.instrument?.symbol !== this.instrument?.symbol ||
      trade.instrument?.exchange !== this.instrument?.exchange)
      return;

    this._counter++;
    const prevltqItem = this._lastTradeItem;
    let needCentralize = false;
    const max = this._max;
    // console.log('_handleTrade', prevltqItem?.lastPrice, Date.now() - trade.timestamp, trade.price, trade.volume);
    const _item = this._getItem(trade.price);

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

    if (!prevltqItem || needCentralize)
      this.centralize();

    this._lastTrade = trade;
    this._lastTradeItem = _item;

    this._calculateLevels();
    this._updateVolumeColumn();

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
    let volume1: HistogramCell;
    let volume2: HistogramCell;
    const maxVolume = items[pointOfControlIndex]?.volume?._value || 0;

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
      // console.log(pointOfControlIndex);
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
    if (isNaN(lastPrice) || lastPrice == null)
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
      this._handleNewBestAsk(this._bestAskPrice);

    if (this._bestBidPrice)
      this._handleNewBestBid(this._bestBidPrice);
  }

  protected _ttt = 0;

  protected _handleQuote(trade: IQuote) {
    if (trade.instrument?.symbol !== this.instrument?.symbol
      || trade.instrument?.exchange !== this.instrument?.exchange) return;

    this._counter++;
    const item = this._getItem(trade.price);

    if (this._ttt++ > 1000) {
      console.log('_handleQuote', trade.side, Date.now() - trade.timestamp, trade.updateType, trade.price, trade.volume);
      this._ttt = 0;
    }

    const items = this.items;
    if (!items.length)
      this.fillData(trade.price);

    const isBid = trade.side === QuoteSide.Bid;
    const size = (isBid ? item.bid._value : item.ask._value) ?? 0;

    item.handleQuote(trade);

    if ((isBid && item.bid.status === SumStatus) || (!isBid && item.ask.status === SumStatus)) {
      return;
    }

    const max = this._max;
    const needRecalculate = trade.updateType === UpdateType.Undefined;
    const needClear = trade.volume === 0;

    if (isBid) {
      if (item.bid.visible) {
        if (!needRecalculate) {
          if (max.bid === size) {
            this._calculateBidHist(true);
          } else if (max.bid < item.bid.size) {
            max.bid = item.bid.size;
            this._calculateBidHist();
          }
        }

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
        }

        this.askSumItem.ask.updateValue(this.askSumItem.ask._value - size + (item.ask._value ?? 0));
      }
    }

    if (needRecalculate) {
      const price = trade.price;

      if (isBid || (needClear && !isBid)) {
        // if (this._bestBidPrice !== price || needClear) {
        if (!needClear)
          this._bestBidPrice = price;

        this._handleNewBestBid(price);
        // }
      } else if (!isBid || (needClear && isBid)) {
        // if (this._bestAskPrice !== price || needClear) {
        if (!needClear)
          this._bestAskPrice = price;

        this._handleNewBestAsk(price);
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

      while (_item && _item.ask.visible && _item.ask.status !== SumStatus) {
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

    while (_item && _item.ask.visible && _item.ask.status !== SumStatus) {
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

      while (_item && _item.bid.visible && _item.bid.status !== SumStatus) {
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

    while (_item && _item.bid.visible && _item.bid.status !== SumStatus) {
      _item.bid.calcHist(max.bid);
      _item = items[++index];
    }
  }

  _handleNewBestBid(price: number) {
    const items = this.items;
    const marketDepth = this._marketDepth;
    const marketDeltaDepth = this._marketDeltaDepth;

    this.bidSumItem.setBidSum(null);

    let item = this._getItem(price);
    let index = item.index;
    let rIndex = index;
    const lastMarketDepthIndex = index + marketDepth;
    const lastMarketDeltaDepthIndex = index + marketDeltaDepth;
    let sum = 0;
    let max = 0;

    while (items[--rIndex]?.isBidSideVisible) {
      items[rIndex].setBidVisibility(true, true);
      items[rIndex].clearCurrentBidBest();
      items[rIndex].clearBidDelta();
    }

    while (item) {
      item.side = QuoteSide.Bid;

      if (item.lastPrice !== price) {
        item.clearBidDelta();
        item.clearCurrentBidBest();
      }

      const isVisible = lastMarketDepthIndex > item.index;
      const isDeltaVisible = lastMarketDeltaDepthIndex > item.index;
      if (!item.isBidSideVisible && !isVisible && !isDeltaVisible)
        break;

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

  _handleNewBestAsk(price: number) {
    const items = this.items;

    const marketDepth = this._marketDepth;
    const marketDeltaDepth = this._marketDeltaDepth;

    this.askSumItem.setAskSum(null);

    let item = this._getItem(price);
    let index = item.index;
    let rIndex = index;
    const lastMarketDepthIndex = index - marketDepth;
    const lastMarketDeltaDepthIndex = index - marketDeltaDepth;
    let sum = 0;
    let max = 0;

    while (items[++rIndex]?.isAskSideVisible) {
      items[rIndex].setAskVisibility(true, true);
      items[rIndex].clearCurrentAskBest();
      items[rIndex].clearAskDelta();
    }

    while (item) {
      item.side = QuoteSide.Ask;

      if (item.lastPrice !== price) {
        item.clearAskDelta();
        item.clearCurrentAskBest();
      }

      const isVisible = lastMarketDepthIndex < item.index;
      const isDeltaVisible = lastMarketDeltaDepthIndex < item.index;
      if (!item.isAskSideVisible && !isVisible && !isDeltaVisible)
        break;

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
    if (!this._settings.general?.commonView?.centerLine)
      return;

    grid.forEachRow((row, y) => {
      if (!row.isCenter)
        return;

      const ctx = e.ctx;
      const width = e.ctx.canvas.width;
      const rowHeight = grid.style.rowHeight;
      y += rowHeight;

      ctx.beginPath();
      ctx.strokeStyle = this._settings.common?.generalColors?.centerLineColor;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
  }

  transformAccountLabel(label: string) {
    const replacer = '*';
    const { hideAccountName, hideFromLeft, hideFromRight, digitsToHide } = this._settings.general;
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
    this.broadcastData(DomSettingsSelector, { action: 'close', linkKey: this._getSettingsKey() } as IDomSettingsEvent);
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
    // console.log('this.keysStack', this.keysStack.hashCode());
    const keyBinding = Object.entries(this._settings.hotkeys)
      .filter(([name, item]) => item)
      .map(([name, item]) => [name, KeyBinding.fromDTO(item as any)])
      .find(([name, binding]) => (binding as KeyBinding).equals(this.keysStack));

    if (keyBinding) {
      console.warn(keyBinding[0]);
      this.domKeyHandlers[keyBinding[0] as string]();
      return true;
    }
  }

  handleChangeFormPosition(position: FormDirection): void {
    this.currentDirection = position;
    this._validateComponentWidth();
  }

  onResize(data): void {
    this._validateComponentWidth();
  }

  onColumnResize(data): void {
    this._validateComponentWidth();
  }

  private _validateComponentWidth(): void {
    const currentGridWidth = this.dataGrid.tableContainer.nativeElement.offsetWidth;
    const minGridWidth = Math.floor(this.dataGrid.scrollWidth);
    const window = this._windowManagerService.getWindowByComponent(this);
    const minWindowWidth = minGridWidth + (window._container.offsetWidth - currentGridWidth);
    window.options.minWidth = minWindowWidth;

    if (minGridWidth > currentGridWidth) {
      window.width = minWindowWidth;
      this.dataGrid.resize();
    }
  }

  toggleTrading(): void {
    this._tradeHandler.toggleTradingEnabled();
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
      orderForm: {
        quantity: (this.domForm.form.controls as SideOrderForm).quantity.value
      }
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

    if (!state?.instrument)
      state.instrument = {
        id: 'ESM1',
        description: 'E-Mini S&P 500',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        contractSize: 50,
        symbol: 'ESM1',
      };
    // for debug purposes

    this._observe();
    this.refresh();

    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
    this.orderFormState = state.orderForm;
  }

  openSettings(hidden = false) {
    const settingsExists = this.layout.findComponent((item: IWindow) => {
      return item?.options.componentState()?.state?.linkKey === this._getSettingsKey();
    });
    if (settingsExists)
      this._closeSettings();
    else
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
        hidden,
      });
  }

  private _createOrder(side: OrderSide, price?: number, orderConfig: Partial<IOrder> = {}) {
    if (this.isTradingLocked)
      return;

    if (!this._domForm.valid) {
      this.notifier.showError('Please fill all required fields in form');
      return;
    }

    const form = this._domForm.getDto();
    const { exchange, symbol } = this.instrument;
    // #TODO need test
    const priceSpecs = this._getPriceSpecs({ ...form, side }, price);
    this._ordersRepository.createItem({
      ...form,
      ...priceSpecs,
      ...orderConfig,
      exchange,
      side,
      symbol,
      accountId: this._accountId,
    }).pipe(untilDestroyed(this))
      .subscribe(
        (res) => console.log('Order successfully created'),
        (err) => this.notifier.showError(err)
      );
  }

  private _createOrderByClick(column: string, item: DomItem) {
    const side = column === Columns.Ask ? OrderSide.Sell : OrderSide.Buy;
    if (this.ocoStep === OcoStep.None) {
      this._createOrder(side, item.price._value);
    } else {
      this._addOcoOrder(side, item);
    }
  }

  private _addOcoOrder(side, item: DomItem) {
    if (!this.buyOcoOrder && side === OrderSide.Buy) {
      item.createOcoOrder(side, this._domForm.getDto());
      const order = { ...this._domForm.getDto(), side };
      const specs = this._getPriceSpecs(order, +item.price.value);
      this.buyOcoOrder = { ...order, ...specs };
      this._createOcoOrder();
    }
    if (!this.sellOcoOrder && side === OrderSide.Sell) {
      item.createOcoOrder(side, this._domForm.getDto());
      const order = { ...this._domForm.getDto(), side };
      const specs = this._getPriceSpecs(order, +item.price.value);
      this.sellOcoOrder = { ...order, ...specs };
      this._createOcoOrder();
    }
  }

  private _getPriceSpecs(item: IOrder & { amount: number }, price) {
    return getPriceSpecs(item, price, this._tickSize);
  }

  private _createOcoOrder() {
    this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
    if (this.buyOcoOrder && this.sellOcoOrder) {
      this.buyOcoOrder.ocoOrder = this.sellOcoOrder;
      this._ordersRepository.createItem(this.buyOcoOrder)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this._clearOcoOrders();
        });
    }
  }

  private _cancelOrderByClick(column: string, item: DomItem) {
    if (!item[column]?.canCancelOrder)
      return;

    if (item.orders?.orders?.length)
      this._ordersRepository.deleteMany(item.orders.orders)
        .pipe(untilDestroyed(this))
        .subscribe(
          () => console.log('delete order'),
          (error) => this.notifier.showError(error),
        );
  }

  handleFormAction(action: FormActions) {
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
        this._createSellMarketOrder();
        break;
      case FormActions.CreateBuyMarketOrder:
        this._createBuyMarketOrder();
        break;
      default:

        console.error('Undefined action');
    }
  }

  _clearOcoOrders() {
    this.ocoStep = OcoStep.None;
    this.sellOcoOrder = null;
    this.buyOcoOrder = null;
    this.items.forEach(item => item.clearOcoOrder());
  }

  _createBuyMarketOrder() {
    this._createOrder(OrderSide.Buy, null, { type: OrderType.Market });
  }

  _createSellMarketOrder() {
    this._createOrder(OrderSide.Sell, null, { type: OrderType.Market });
  }

  private _closePositions() {
    this._positionsRepository.deleteMany({
      accountId: this._accountId,
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
      return `${ this.instrument.symbol } - ${ this.instrument.description }`;
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._clearInterval)
      this._clearInterval();

    const instrument = this.instrument;
    if (!instrument)
      return;
    this._unsubscribeFromInstrument();
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


export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
