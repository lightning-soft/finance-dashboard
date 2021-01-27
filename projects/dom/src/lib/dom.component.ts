import { AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { LoadingComponent } from 'base-components';
import { Id } from 'communication';
import { CellClickDataGridHandler, Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { NotifierService } from 'notifier';
import { SynchronizeFrames } from 'performance';
import {
  IConnection,
  IInstrument,
  ITrade,
  L2,
  Level1DataFeed,
  Level2DataFeed,
  OrderSide,
  OrdersRepository
} from 'trading';
import { DomFormComponent } from './dom-form/dom-form.component';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { DomItem } from './dom.item';
import { histogramComponent, HistogramComponent } from './histogram';
import { HistogramCell } from './histogram/histogram.cell';

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
const DOM_HOTKEYS = 'domHotkeys';

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
      this.centralize();
    },
    autoCenterAllWindows: () => {
      this.broadcastHotkeyCommand('autoCenter');
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
      for (let item of this.items) {
        item.totalBid.clear();
        item.totalAsk.clear();
      }
    },
    clearCurrentTrades: () => {
      for (let item of this.items) {
        item.currentAsk.clear();
        item.currentBid.clear();
      }
    },
    clearCurrentTradesAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTrades');
    },
    clearCurrentTradesDown: () => {
      this.getDownItems(item => {
        item.currentAsk.clear();
        item.currentBid.clear();
      });
    },
    clearCurrentTradesDownAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTradesDown');
    },
    clearCurrentTradesUp: () => {
      this.getUpItems((item) => {
        item.currentAsk.clear();
        item.currentBid.clear();
      });
    },
    clearCurrentTradesUpAllWindows: () => {
      this.broadcastHotkeyCommand('clearCurrentTradesUp');
    },
    clearTotalTradesDown: () => {
      this.getDownItems((item) => {
        item.totalAsk.clear();
        item.totalBid.clear();
      });
    },
    clearTotalTradesDownAllWindows: () => {
      this.broadcastHotkeyCommand('clearTotalTradesDown');
    },
    clearTotalTradesUp: () => {
      this.getUpItems((item) => {
        item.totalAsk.clear();
        item.totalBid.clear();
      });
    },
    clearTotalTradesUpAllWindows: () => {
      this.broadcastHotkeyCommand('clearTotalTradesUp');
    },
    clearVolumeProfile: () => {
      for (let item of this.items) {
        item.volume.clear();
      }
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
      link: DOM_HOTKEYS,
      handleLinkData: (key: string) => {
        this.domKeyHandlers[key]();
      },
    });
    this.addLinkObserver({
      link: DomSettingsSelector,
      handleLinkData: (settings: DomSettings) => {
        const common = settings.common;
        if (common) {
          for (const column of this.columns) {
            column.visible = common[column.name] != false;
          }
        }
        this.dataGrid.applyStyles({
          font: `${common.fontWeight || ''} ${common.fontSize}px ${common.fontFamily}`,
          gridBorderColor: common.generalColors.gridLineColor,
        })
        this._settings.merge(settings);
        this.detectChanges(true);
      }
    });
  }

  broadcastHotkeyCommand(commandName: string) {
    this.broadcastData(DOM_HOTKEYS, commandName);
  }

  getUpItems(handler: (item) => void) {
    const centerIndex = this.items.findIndex(item => item.isCenter);
    this.items.slice(0, centerIndex)
      .forEach(item => {
        handler(item);
      });
  }

  getDownItems(handler: (item) => void) {
    const centerIndex = this.items.findIndex(item => item.isCenter);
    this.items.slice(centerIndex, this.items.length)
      .forEach(item => {
        handler(item);
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
      var index = ROWS / 2;
      if (this._lastPrice) {
        for (let i = 0; i < this.items.length; i++) {
          const item = this.items[i];
          if (item.lastPrice == this._lastPrice)
            index = i;

          item.isCenter = false;
        }
      }

      if (this.items[index])
        this.items[index].isCenter = true;

      grid.scrollTop = index * grid.rowHeight - visibleRows / 2 * grid.rowHeight;
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
      price = this._normalizePrice(price);
      data.push(this._getItem(price));
    }
  }

  protected _handleTrade(trade: ITrade) {
    // console.time('_handleTrade')
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;

    const prevItem = this._getItem(this._lastPrice);
    prevItem.clearLTQ();

    const lastPrice = this._lastPrice = this._normalizePrice(trade && trade.price);

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
          if (hist[key] == null || i[key].component != 'histogram')
            continue;

          (i[key] as HistogramCell).calcHist(hist[key]);
        }
      }
    }
  }

  afterDraw = (e, grid) => {
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
    })
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

  private _normalizePrice(price) {
    const tickSize = this._tickSize;
    return +(Math.round((price + tickSize) / tickSize) * tickSize).toFixed(this.instrument.precision);
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
