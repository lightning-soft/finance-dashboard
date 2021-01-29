import { AfterViewInit, Component, ElementRef, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { LoadingComponent } from 'base-components';
import { Id } from 'communication';
import { CellClickDataGridHandler, Column, DataGrid, ICellSettings, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { NotifierService } from 'notifier';
import { SynchronizeFrames } from 'performance';
import { IConnection, IInstrument, ITrade, L2, Level1DataFeed, Level2DataFeed, OrderSide, OrdersRepository } from 'trading';
import { DomFormComponent } from './dom-form/dom-form.component';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { DomItem } from './dom.item';
import { DomHandler } from './handlers';
import { histogramComponent, HistogramComponent, IHistogramSettings } from './histogram';
import { HistogramCell } from './histogram/histogram.cell';
import { PriceCell } from './price.cell';

export interface DomComponent extends ILayoutNode, LoadingComponent<any, any> {
}

export class DomItemMax {
  ask: number;
  bid: number;
  volume: number;
  totalAsk: number;
  totalBid: number;

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

    // if (result && Object.keys(result).some(k => {
    //   if(result[k] == null) {
    //     delete result[k];
    //     return true
    //   }
    //   return false
    // })) {
    //   console.error('suke')
    // }

    return result;
  }
}

class RedrawInfo {
  _needRedraw = false;

  private _scrolledItems = 0;

  public get scrolledItems() {
    return this._scrolledItems;
  }

  public set scrolledItems(value) {
    this.needRedraw();
    this._scrolledItems = value;
  }

  needRedraw() {
    this._needRedraw = true;
  }

  markDrawed() {
    this._needRedraw = false;
  }
}

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
    ['currentBid', 'c.bid'],
    ['currentAsk', 'c.ask'],
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
  private _dom = new DomHandler();

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
  isTradingLocked = false;
  bracketActive = true;
  isExtended = true;

  directionsHints = directionsHints;

  private _instrument: IInstrument;
  private _redrawInfo = new RedrawInfo();

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

  private _map = new Map<number, DomItem>();

  private _lastPrice: number;

  get trade() {
    return this._lastPrice;
  }

  private _settings: DomSettings = new DomSettings();

  get domFormSettings() {
    return this._settings.orderArea.formSettings;
  }

  private _lastSyncTime = 0;

  private _changedTime = 0;

  constructor(
    private _ordersRepository: OrdersRepository,
    private _levelOneDatafeed: Level1DataFeed,
    protected _accountsManager: AccountsManager,
    protected _notifier: NotifierService,
    private _levelTwoDatafeed: Level2DataFeed,
    protected _injector: Injector,
    private _renderer: Renderer2
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
        this._settings.merge(settings);
      }
    });
  }

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._ordersRepository = this._ordersRepository.forConnection(connection);
  }

  scroll = (e: WheelEvent) => {
    const info = this._redrawInfo;
    if (e.deltaY > 0) {
      info.scrolledItems++;
    } else if (e.deltaY < 0) {
      info.scrolledItems--;
    }

    this._calculate();
    e.preventDefault();
  }

  ngAfterViewInit() {
    this._handleResize();
    const element = this.dataGridElement && this.dataGridElement.nativeElement;
    this.onRemove(this._renderer.listen(element, 'wheel', this.scroll));
  }

  centralize() {
    this._redrawInfo.scrolledItems = 0;
    this._calculate();
    this.detectChanges();
  }

  @SynchronizeFrames()
  detectChanges() {
    // console.time('detectChanges')
    this.dataGrid.detectChanges();
    // console.timeEnd('detectChanges')
    // console.log(Date.now() - this._lastSyncTime)
    this._lastSyncTime = Date.now();
  }

  @SynchronizeFrames()
  private _calculateAsync() {
    this._calculate();
    this.dataGrid.detectChanges();
  }

  private _getItem(price: number): DomItem {
    if (!this._map.has(price)) {
      const item = new DomItem(price, this._settings, this._priceFormatter);
      this._map.set(price, item);
      item.setPrice(price);
    }

    return this._map.get(price);
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
      const data = this.items;
      const rows = 400;
      let price = lastPrice - tickSize * rows / 2;
      const maxPrice = lastPrice + tickSize * rows / 2;

      while (price < maxPrice) {
        price = +(Math.round((price + tickSize) / tickSize) * tickSize).toFixed(this.instrument.precision)
        data.push(this._getItem(price));
      }

      this._handleResize();
      requestAnimationFrame(() => {
        const grid = this.dataGrid;
        const visibleRows = grid.getVisibleRows();
        grid.scrollTop = rows * grid.rowHeight / 2 - visibleRows / 2 * grid.rowHeight;
      });
    }

    const item = this._getItem(lastPrice);
    this._handleMaxChange(item.handleTrade(trade));
    const newChangedTime = Math.max(item.currentAsk.time, item.currentBid.time);
    if (newChangedTime != this._changedTime) {
      for (const i of this.items)
        i.clearDelta();

      this._changedTime = newChangedTime;
    }
    // console.timeEnd('_handleTrade')
    // this._dom.handleTrade(trade);
    // this._calculateAsync();
    this.detectChanges();
  }

  protected _handleL2(l2: L2) {
    // console.time('_handleL2')
    if (l2.instrument?.symbol !== this.instrument?.symbol) return;
    // this._dom.handleL2(l2);
    this._handleMaxChange(this._getItem(l2.price).handleL2(l2));
    // console.timeEnd('_handleL2')

    // this._calculateAsync();
    this.detectChanges();
  }

  private _handleMaxChange(max: any) {
    const hist = this._max.handleChanges(max)
    const keys = hist && Object.keys(hist)

    if (Array.isArray(keys) && keys.length) {
      for (const i of this.items) {
        for (const key of keys) {
          if (hist[key] == null)
            continue;

          (i[key] as HistogramCell).calcHist(hist[key]);
        }
      }

      if (this.items.some(i => i.bid.hist > 1))
        console.warn('more than 1')
    }
  }

  private _calculate() {
    const itemsCount = this.items.length;

    const instrument = this.instrument;
    if (!instrument)
      return;

    const info = this._redrawInfo;
    const data: DomItem[] = this.items;
    const dom = this._dom;
    const precision = instrument.precision;
    const tickSize = instrument.tickSize;
    let last = this._lastPrice;

    // if (!info._needRedraw) {
    //   for (const item of data) {
    //     item.updatePrice(item.lastPrice, dom, item.lastPrice === last);
    //   }
    // } else {
    //   let centerIndex = Math.floor((itemsCount - 1) / 2) + info.scrolledItems;
    //   // const tickSize = 0.01;
    //   let upIndex = centerIndex - 1;
    //   let downIndex = centerIndex + 1;
    //   let price = last;
    //   let item: DomItem;

    //   if (last == null || isNaN(last))
    //     return;

    //   if (centerIndex >= 0 && centerIndex < itemsCount) {
    //     item = data[centerIndex];
    //     item.updatePrice(last, dom, true);
    //   }

    //   while (upIndex >= 0) {
    //     price = sum(price, tickSize, precision);
    //     if (upIndex >= itemsCount) {
    //       upIndex--;
    //       continue;
    //     }

    //     item = data[upIndex];
    //     item.updatePrice(price, dom);
    //     upIndex--;
    //   }

    //   price = last;

    //   while (downIndex < itemsCount) {
    //     price = sum(price, -tickSize, precision);
    //     if (downIndex < 0) {
    //       downIndex++;
    //       continue;
    //     }

    //     item = data[downIndex];
    //     item.updatePrice(price, dom);
    //     downIndex++;
    //   }

    //   info.markDrawed();
    // }

    this._lastSyncTime = Date.now();
  }

  afterDraw = (grid) => {
    const ctx = grid.ctx;
    // ctx.save();
    const y = Math.ceil(this.visibleRows / 2) * this.dataGrid.rowHeight;
    const width = grid.ctx.canvas.width;
    ctx.beginPath();
    ctx.strokeStyle = '#A1A2A5';
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    // ctx.restore();
  }

  renderText = (e) => {
    const ctx = e.ctx;
    const cell = e.cell;
    const value = cell.value;

    const settings = value.settings;

    if (!settings)
      return;

    if (settings.textAlign)
      cell.horizontalAlignment = settings.textAlign;

    if (settings.fontColor)
      e.ctx.fillStyle = settings.fontColor;

    if (cell.header.name == 'price') {
      const s: any = settings;
      const v: PriceCell = value;

      if (!v.isTraded && s.nonTradedPriceBackColor) {
        ctx.fillStyle = s.nonTradedPriceBackColor;
      }
    }

  }

  renderCell = (e) => {
    const cell = e.cell;
    const value = cell.value;

    const settings: ICellSettings = value.settings;

    if (!settings)
      return;
    const ctx = e.ctx;

    if (settings.backgroundColor)
      ctx.fillStyle = settings.backgroundColor;

    if (cell.header.name == 'price') {
      const s: any = settings;
      const v: PriceCell = value;

      if (v.isTraded && s.tradedPriceBackColor) {
        ctx.fillStyle = s.tradedPriceBackColor;
      }
    }

    if (settings.highlightBackgroundColor && value.time >= this._lastSyncTime)
      ctx.fillStyle = settings.highlightBackgroundColor;
  }

  afterRenderCell = (e) => {
    const ctx = e.ctx;
    const cell = e.cell;
    const value = cell.value;
    const data = cell.data;

    const name = cell.header.name;

    if (data.isCenter && name == 'price')
      e.ctx.fillStyle = 'red';

    const settings = value.settings;

    if (!settings)
      return;

    if (settings.backgroundColor)
      e.ctx.fillStyle = settings.backgroundColor;

    if (!value?.component)
      return;

    switch (value.component) {
      case 'histogram-component':
        const s: IHistogramSettings = settings as IHistogramSettings;
        if (s.enableHistogram == false || !value.hist)
          return;
        // ctx.save();
        ctx.fillStyle = s.histogramColor ?? 'grey';
        if (s.histogramOrientation == 'right') {
          ctx.fillRect(cell.x + cell.width * (1 - value.hist), cell.y, cell.width * value.hist, cell.height);
        } else {
          ctx.fillRect(cell.x, cell.y, cell.width * value.hist, cell.height);
        }
        // ctx.restore();
        break;
    }
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

  private _handleKey(event) {
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

  saveState?(): IDomState {
    return {
      instrument: this.instrument,
      settings: this._settings.toJson()
    };
  }

  loadState?(state: IDomState) {
    this._settings = state?.settings ? DomSettings.fromJson(state.settings) : new DomSettings();
    this.openSettings(true);

    // for debug purposes
    if (!state)
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
