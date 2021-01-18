import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { SynchronizeFrames } from 'performance';
import { HistoryRepository, IInstrument, ITrade, L2, Level1DataFeed, Level2DataFeed } from 'trading';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { DomItem } from './dom.item';
import { DomHandler } from './handlers';
import { histogramComponent, HistogramComponent } from './histogram';

export interface DomComponent extends ILayoutNode {
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
export class DomComponent implements OnInit, AfterViewInit, IStateProvider<IDomState> {
  columns: Column[] = [
    // '_id',
    'orders',
    ['volumeProfile', 'volume'],
    'price',
    ['bidDelta', 'delta'],
    'bid',
    'ltq',
    ['currentBid', 'c.bid'],
    ['currentAsk', 'c.ask'],
    'ask',
    ['askDelta', 'delta'],
    ['totalBid', 't.bid'],
    ['totalAsk', 't.ask'],
    // 'tradeColumn',
    // 'askDepth',
    // 'bidDepth',
  ]
    .map(name => Array.isArray(name) ? name : ([name, name]))
    .map(([name, title]) => ({ name, title: title.toUpperCase(), visible: true }));

  private _dom = new DomHandler();

  directions = ['window-left', 'full-screen-window', 'window-right'];
  currentDirection = this.directions[this.directions.length - 1];
  @ViewChild(DataGrid, { static: true })
  dataGrid: DataGrid;

  @ViewChild(DataGrid, { read: ElementRef })
  dataGridElement: ElementRef;

  isFormOpen = true;
  isLocked: boolean;
  directionsHints = directionsHints;
  private _scrolledItems = 0;
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

  visibleRows = 0;

  get items() {
    return this.dataGrid.items;
  }

  set items(value) {
    this.dataGrid.items = value;
  }

  private _trade: ITrade;

  get trade() {
    return this._trade;
  }

  private _settings: DomSettings = new DomSettings();


  constructor(
    private _accountsManager: AccountsManager,
    private _historyRepository: HistoryRepository,
    private _levelOneDatafeed: Level1DataFeed,
    private _levelTwoDatafeed: Level2DataFeed,
    private _renderer: Renderer2,
  ) {
    this.setTabIcon('icon-widget-dom');
  }

  ngOnInit(): void {
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

  scroll = (e: WheelEvent) => {
    if (e.deltaY > 0) {
      this._scrolledItems++;
    } else if (e.deltaY < 0) {
      this._scrolledItems--;
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
    this._scrolledItems = 0;
    this._calculate();
    this.detectChanges();
  }

  detectChanges() {
    this.dataGrid.detectChanges();
  }

  @SynchronizeFrames()
  private _calculateAsync() {
    this._calculate();
    this.dataGrid.detectChanges();
  }

  protected _handleTrade(trade: ITrade) {
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;
    this._trade = trade;
    this._dom.handleTrade(trade);
    this._calculateAsync();
  }

  protected _handleL2(l2: L2) {
    if (l2.instrument?.symbol !== this.instrument?.symbol) return;
    this._dom.handleL2(l2);
    this._calculateAsync();
  }

  private _calculate(move?: number) {
    const itemsCount = this.visibleRows;

    let trade = this._trade;
    let instrument = this.instrument;
    if (!instrument)
      return;

    let last = trade && trade.price;
    let centerIndex = Math.floor((itemsCount - 1) / 2) + this._scrolledItems;
    // const tickSize = instrument.tickSize;
    const tickSize = 0.01;
    const step = instrument.precision;
    const data: DomItem[] = this.items;
    let upIndex = centerIndex - 1;
    let downIndex = centerIndex + 1;
    let price = last;
    let item: DomItem;
    const dom = this._dom;

    if (last == null || isNaN(last))
      return;

    if (centerIndex >= 0 && centerIndex < itemsCount) {
      item = data[centerIndex];
      item.updatePrice(last, dom, true);
    }

    while (upIndex >= 0) {
      price = sum(price, tickSize, step);
      if (upIndex >= itemsCount) {
        upIndex--;
        continue;
      }

      item = data[upIndex];
      item.updatePrice(price, dom);
      upIndex--;
    }

    price = last;

    while (downIndex < itemsCount) {
      price = sum(price, -tickSize, step);
      if (downIndex < 0) {
        downIndex++;
        continue;
      }

      item = data[downIndex];
      item.updatePrice(price, dom);
      downIndex++;
    }
  }

  renderCell = (e) => {
    const ctx = e.ctx;
    const cell = e.cell;
    const value = cell.value;
    const data = cell.data;

    const name = cell.header.name;


    if (data.isCenter && name == 'price')
      e.ctx.fillStyle = 'red';

    if (!value?.component)
      return;

    switch (value.component) {
      case 'histogram-component':
        ctx.save();
        ctx.fillStyle = value.settings.histogramColor ?? 'grey';
        ctx.fillRect(cell.x, cell.y, cell.width * value.hist, cell.height);
        ctx.restore();
        break;
    }

    if (value.settings.backgroundColor)
      e.ctx.fillStyle = value.settings.backgroundColor;
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
    }

    return true;
  }

  @SynchronizeFrames()
  private _handleResize() {
    const data = this.items;
    const visibleRows = this.visibleRows = this.dataGrid.getVisibleRows();

    if (data.length !== visibleRows) {
      if (data.length > visibleRows)
        data.splice(visibleRows, data.length - visibleRows);
      else if (data.length < visibleRows)
        while (data.length <= visibleRows + 1)
          data.push(new DomItem(data.length, this._settings, this._priceFormatter));
    }

    this.dataGrid.resize();
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
        description: "E-Mini S&P 500",
        exchange: "CME",
        tickSize: 0.25,
        precision: 2,
        symbol: "ESH1",
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
      removeIfExists: !hidden,
      hidden,
    });
  }

  ngOnDestroy() {
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
