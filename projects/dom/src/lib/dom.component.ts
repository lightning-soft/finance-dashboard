import { AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { LoadingComponent } from 'base-components';
import { Id } from 'communication';
import { CellClickDataGridHandler, Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { NotifierService } from 'notifier';
import { SynchronizeFrames } from 'performance';
import { IConnection, IInstrument, ITrade, L2, Level1DataFeed, Level2DataFeed, OrderSide, OrdersRepository } from 'trading';
import { DomFormComponent } from './dom-form/dom-form.component';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { DomItem } from './dom.item';
import { histogramComponent, HistogramComponent } from './histogram';
import { HistogramCell } from './histogram/histogram.cell';
import { KeyboardListener, KeyBinding } from 'keyboard';

export interface DomComponent extends ILayoutNode, LoadingComponent<any, any> {
}

export class DomItemMax {
  ask: number;
  bid: number;
  volume: number;
  totalAsk: number;
  totalBid: number;
  currentAsk: number;
  currentBid: number;

  handleChanges(change): any {
    let result;
    if (!change)
      return;

    for (const key in change) {
      if (change[key] == null || this[key] >= change[key])
        continue;

      if (result == null)
        result = {};

      this[key] = change[key];
      result[key] = change[key];
    }
    return result;
  }

  clear() {
    this.ask = null;
    this.bid = null;
    this.volume = null;
    this.totalAsk = null;
    this.totalBid = null;
    this.currentAsk = null;
    this.currentBid = null;
  }
}

const ROWS = 400;
interface IDomState {
  instrument: IInstrument;
  settings?: any;
}

const directionsHints = {
  'window-left': 'Left View',
  'full-screen-window': 'Horizontal View',
  'window-right': 'Right View',
};
const topDirectionIndex = 1;

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
  styleUrls: ['./dom.component.scss'],
  providers: [
    {
      provide: IViewBuilderStore,
      useValue: {
        [histogramComponent]: HistogramComponent
      }
    }
  ]
})
@LayoutNode()
export class DomComponent extends LoadingComponent<any, any> implements OnInit, AfterViewInit, IStateProvider<IDomState> {
  columns: Column[] = [
    '_id',
    'orders',
    ['volume', 'volume', 'histogram'],
    'price',
    ['bidDelta', 'delta'],
    ['bid', 'bid', 'histogram'],
    'ltq',
    ['currentBid', 'c.bid', 'histogram'],
    ['currentAsk', 'c.ask', 'histogram'],
    ['ask', 'ask', 'histogram'],
    ['askDelta', 'delta'],
    ['totalBid', 't.bid', 'histogram'],
    ['totalAsk', 't.ask', 'histogram'],
    // 'tradeColumn',
    // 'askDepth',
    // 'bidDepth',
  ]
    .map(name => Array.isArray(name) ? name : ([name, name]))
    .map(([name, title, type]) => ({
      name,
      type,
      // style: name,
      // style: type,
      title: title.toUpperCase(),
      visible: true
    }));

  accountId: Id;
  keysStack: KeyboardListener = new KeyboardListener();
  domKeyHandlers = {
    autoCenter: () => {
    },
    autoCenterAllWindows: () => {
    },
    buyMarket: () => {
    },
    sellMarket: () => {
    },
    hitBid: () => {
    },
    joinBid: () => {
    },
    liftOffer: () => {
    },
    oco: () => {
    },
    flatten: () => {
    },
    cancelAllOrders: () => {
    },
    quantity1: () => {
    },
    quantity2: () => {
    },
    quantity3: () => {
    },
    quantity4: () => {
    },
    quantity5: () => {
    },
    quantityToPos: () => {
    },
    stopsToPrice: () => {
    },
    clearAlerts: () => {
    },
    clearAlertsAllWindow: () => {
    },
    clearAllTotals: () => {
    },
    clearCurrentTradesAllWindows: () => {
    },
    clearCurrentTradesDown: () => {
    },
    clearCurrentTradesDownAllWindows: () => {
    },
    clearCurrentTradesUp: () => {
    },
    clearCurrentTradesUpAllWindows: () => {
    },
    clearTotalTradesDown: () => {
    },
    clearTotalTradesDownAllWindows: () => {
    },
    clearTotalTradesUp: () => {
    },
    clearTotalTradeUpAllWindows: () => {
    },
    clearVolumeProfile: () => {
    }
  };

  @ViewChild(DomFormComponent)
  private _domForm: DomFormComponent;

  handlers = [
    ...['bid', 'ask'].map(column => (
      new CellClickDataGridHandler<DomItem>({
        column, handler: (item) => this._createOrder(column, item),
      })
    )),
  ];

  directions = ['window-left', 'full-screen-window', 'window-right'];
  currentDirection = this.directions[this.directions.length - 1];

  @ViewChild(DataGrid, { static: true })
  dataGrid: DataGrid;

  @ViewChild(DataGrid, { read: ElementRef })
  dataGridElement: ElementRef;

  isFormOpen = true;
  isLocked: boolean;
  bracketActive = true;
  isExtended = true;

  directionsHints = directionsHints;

  private _instrument: IInstrument;
  private _priceFormatter: IFormatter;

  public get instrument(): IInstrument {
    return this._instrument;
  }

  public set instrument(value: IInstrument) {
    if (this._instrument?.id == value.id)
      return;

    this._instrument = value;
    this._priceFormatter = new RoundFormatter(3);
    this._levelOneDatafeed.subscribe(value);
    this._levelTwoDatafeed.subscribe(value);
  }

  get isFormOnTop() {
    return this.currentDirection === this.directions[topDirectionIndex];
  }

  visibleRows = 0;

  get items() {
    return this.dataGrid.items ?? [];
  }

  set items(value) {
    this.dataGrid.items = value;
  }

  private _max = new DomItemMax()
  private _lastChangesItem: { [key: number]: DomItem } = {}

  private _map = new Map<number, DomItem>();

  private _lastPrice: number;

  get trade() {
    return this._lastPrice;
  }

  private _settings: DomSettings = new DomSettings();

  private _changedTime = 0;

  private get _tickSize() {
    // const tickSize = this.instrument.tickSize ?? 0.25;
    return 0.01;
  }
  get domFormSettings() {
    return this._settings.orderArea.formSettings;
  }



  constructor(
    private _ordersRepository: OrdersRepository,
    private _levelOneDatafeed: Level1DataFeed,
    protected _accountsManager: AccountsManager,
    protected _notifier: NotifierService,
    private _levelTwoDatafeed: Level2DataFeed,
    protected _injector: Injector,
  ) {
    super();
    this.setTabIcon('icon-widget-dom');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._ordersRepository = this._ordersRepository.forConnection(connection);
      });
    this.onRemove(
      this._levelOneDatafeed.on((trade: ITrade) => this._handleTrade(trade)),
      this._levelTwoDatafeed.on((item: L2) => this._handleL2(item))
    );

    this.addLinkObserver({
      link: DomSettingsSelector,
      handleLinkData: (settings) => {
        console.log(settings);
        this._settings.merge(settings);
        this.detectChanges(true);
      }
    });
  }

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._ordersRepository = this._ordersRepository.forConnection(connection);
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  centralize() {
    this._handleResize();
    requestAnimationFrame(() => {
      const grid = this.dataGrid;
      const visibleRows = grid.getVisibleRows();
      grid.scrollTop = ROWS * grid.rowHeight / 2 - visibleRows / 2 * grid.rowHeight;
    });
    this.detectChanges();
  }

  @SynchronizeFrames()
  detectChanges(force = false) {
    this.dataGrid.detectChanges(force);
  }

  private _getItem(price: number): DomItem {
    if (!this._map.has(price)) {
      const item = new DomItem(price, this._settings, this._priceFormatter);
      this._map.set(price, item);
      item.setPrice(price);
    }

    return this._map.get(price);
  }

  private _fillData(lastPrice: number) {
    this.items = [];
    this._map.clear();
    this._max.clear()
    const data = this.items;
    const tickSize = this._tickSize;

    let price = lastPrice - tickSize * ROWS / 2;
    const maxPrice = lastPrice + tickSize * ROWS / 2;

    while (price < maxPrice) {
      price = +(Math.round((price + tickSize) / tickSize) * tickSize).toFixed(this.instrument.precision)
      data.push(this._getItem(price));
    }
  }

  protected _handleTrade(trade: ITrade) {
    // console.time('_handleTrade')
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;

    const prevItem = this._getItem(this._lastPrice);
    prevItem.clearLTQ();

    // const tickSize = this.instrument.tickSize ?? 0.25;
    const tickSize = 0.01
    const lastPrice = this._lastPrice = Math.round(trade && trade.price / tickSize) * tickSize;

    if (!this.items.length) {
      this._fillData(lastPrice); // todo: load order book
      this.centralize();
    }

    const item = this._getItem(lastPrice);
    this._handleMaxChange(item.handleTrade(trade), item);
    const newChangedTime = Math.max(item.currentAsk.time, item.currentBid.time);
    if (newChangedTime != this._changedTime) {
      for (const i of this.items)
        i.clearDelta();
    }
    this._changedTime = newChangedTime;
    this.detectChanges();
  }

  protected _handleL2(l2: L2) {
    // console.time('_handleL2')
    if (l2.instrument?.symbol !== this.instrument?.symbol) return;

    const item = this._getItem(l2.price);
    this._handleMaxChange(item.handleL2(l2), item);
    this.detectChanges();
  }

  private _handleMaxChange(changes: any, item: DomItem) {
    const hist = this._max.handleChanges(changes);
    const keys = hist && Object.keys(hist);

    for (const key in changes) {
      const prevItem = this._lastChangesItem[key];
      if (prevItem)
        prevItem.dehighlight(key);

      this._lastChangesItem[key] = item;
    }

    if (Array.isArray(keys) && keys.length) {
      for (const i of this.items) {
        for (const key of keys) {
          if (hist[key] == null)
            continue;

          (i[key] as HistogramCell).calcHist(hist[key]);
        }
      }
    }
  }

  afterDraw = (grid) => {
    const ctx = grid.ctx;

    const y = Math.ceil(this.visibleRows / 2) * this.dataGrid.rowHeight;
    const width = grid.ctx.canvas.width;
    ctx.beginPath();
    ctx.strokeStyle = '#A1A2A5';
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this._handleResize();
        break;
      case LayoutNodeEvent.Event:
        this._handleKey(data);
    }
    return true;
  }

  private  _handleKey(event) {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    this.keysStack.handle(event);
    const keyBinding = Object.entries(this._settings.hotkeys)
      .map(([name, item]) => [name, KeyBinding.fromDTO(item as any)])
      .find(([name, binding]) => {
        return (binding as KeyBinding).equals(this.keysStack);
      });
    if (keyBinding) {
      this.domKeyHandlers[keyBinding[0] as string]();
    }

  }

  @SynchronizeFrames()
  private _handleResize(afterResize?: Function) {
    const data = this.items;
    const visibleRows = this.dataGrid.getVisibleRows();
    const diff = this.visibleRows - visibleRows;
    const change = Math.ceil(diff / 2);
    this.visibleRows = visibleRows;

    if (change != 0) {
      // if (change > 0) {
      //   while
      //   if (data.length > visibleRows)
      //     data.splice(visibleRows, data.length - visibleRows);
      //   else if (data.length < visibleRows)
      //     while (data.length <= visibleRows + 1)
      //       data.push(new DomItem(data.length, this._settings, this._priceFormatter));
      // }
      // this._redrawInfo.needRedraw();
    }

    this.dataGrid.resize();
    if (afterResize)
      afterResize();
  }

  saveState ?(): IDomState {
    return {
      instrument: this.instrument,
      settings: this._settings.toJson()
    };
  }

  loadState ?(state: IDomState) {
    this._settings = state?.settings ? DomSettings.fromJson(state.settings) : new DomSettings();
    this._settings.columns = this.columns;
    this.openSettings(true);

    // for debug purposes
    if (!
      state
    )
      state = {} as any;

    if (!state?.instrument)
      state.instrument = {
        id: 'ESH1',
        description: 'E-Mini S&P 500',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        symbol: 'ESH1',
      };
    // for debug purposes


    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
  }

  openSettings(hidden = false) {
    this.layout.addComponent({
      component: {
        name: DomSettingsSelector,
        state: this._settings,
      },
      closeBtn: true,
      single: true,
      width: 680,
      resizable: false,
      removeIfExists: true,
      hidden,
    });
  }

  private _createOrder(column: string, item: DomItem) {
    if (!this._domForm.valid) {
      this.notifier.showError('Please fill all required fields in form');
      return;
    }
    const side = column === 'bid' ? OrderSide.Buy : OrderSide.Sell;
    const requestPayload = this._domForm.getDto();
    const { exchange, symbol } = this.instrument;
    requestPayload.stopPrice = requestPayload.sl.count;
    requestPayload.limitPrice = requestPayload.tp.count;
    this._ordersRepository.createItem({
      ...requestPayload,
      exchange,
      side,
      accountId: this.accountId,
      symbol
    }).toPromise()
      .then((res) => {
        this.notifier.showSuccess('Order successfully created');
      })
      .catch((err) => {
        this.notifier.showError(err);
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    const instrument = this.instrument;
    if (!instrument)
      return;

    this._levelOneDatafeed.unsubscribe(instrument);
    this._levelTwoDatafeed.unsubscribe(instrument);
  }
}


export function sum(num1, num2, step = 1) {
  step = Math.pow(10, step);
  return (Math.round(num1 * step) + Math.round(num2 * step)) / step;
}
