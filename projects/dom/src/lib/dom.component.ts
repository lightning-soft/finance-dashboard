import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
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
}

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
    '_id',
    'orders',
    'volumeProfile',
    'price',
    'bidDelta',
    'bid',
    'ltq',
    'currentBid',
    'currentAsk',
    'ask',
    'askDelta',
    'totalBid',
    'totalAsk',
    'tradeColumn',
    'askDepth',
    'bidDepth',
  ].map(name => ({name, visible: true}));

  private _dom = new DomHandler();

  directions = ['window-left', 'full-screen-window', 'window-right'];
  currentDirection = this.directions[this.directions.length - 1];
  @ViewChild(DataGrid)
  dataGrid: DataGrid;
  isFormOpen = true;

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

  items = [];

  private _trade: ITrade;

  get trade() {
    return this._trade;
  }

  private _settings: DomSettings = new DomSettings();

  constructor(
    private _accountsManager: AccountsManager,
    private _historyRepository: HistoryRepository,
    private _levelOneDatafeed: Level1DataFeed,
    private _levelTwoDatafeed: Level2DataFeed
  ) {
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
    this._levelOneDatafeed.on((trade: ITrade) => this._handleTrade(trade));
    this._levelTwoDatafeed.on((item: L2) => this._handleL2(item));
    this.addLinkObserver({
      link: DomSettingsSelector,
      handleLinkData: (settings) => this._settings.merge(settings)
    });
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  protected _handleTrade(trade: ITrade) {
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;
    this._trade = trade;
    this._dom.handleTrade(trade);
    this._calculate();
    this.dataGrid.detectChanges();
  }

  protected _handleL2(l2: L2) {
    if (l2.instrument?.symbol !== this.instrument?.symbol) return;
    this._dom.handleL2(l2);
    this._calculate();
    this.dataGrid.detectChanges(); // todo: refactor - dry
  }

  private _calculate(move?: number) {
    const itemsCount = this.visibleRows;

    let trade = this._trade;
    let last = trade && trade.price;
    const scrolledItems = 0// this._scrolledItems
    let centerIndex = Math.floor((itemsCount - 1) / 2) + scrolledItems;
    const tickSize = 0.01; // instrument && instrument.tickSize;
    const step = 2; // instrument && instrument.digits,
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

    while (downIndex <= itemsCount - 1) {
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

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    console.log(name);
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this._handleResize();
        break;
    }
  }

  private _handleResize() {
    setTimeout(() => {
      const data = this.items;
      const visibleRows = this.visibleRows = this.dataGrid.getVisibleRows();

      if (data.length === visibleRows)
        return;

      if (data.length > visibleRows)
        data.splice(visibleRows, data.length - visibleRows);
      else if (data.length < visibleRows)
        while (data.length <= visibleRows)
          data.push(new DomItem(data.length, this._settings, this._priceFormatter));

      this.dataGrid.detectChanges();
    });
  }

  saveState?(): IDomState {
    return {
      instrument: this.instrument,
    };
  }

  loadState?(state: IDomState) {
    // for debug purposes
    if (!state)
      state = {} as any;

    if (!state?.instrument)
      state.instrument = {
        id: 'ESH1',
        symbol: 'ESH1',
        exchange: 'CME',
        tickSize: 0.01,
      };
    // for debug purposes


    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
  }

  openSettings() {
    this.layout.addComponent({
      component: {
        name: DomSettingsSelector,
        state: this._settings,
      },
      maximizeBtn: true,
      closeBtn: true,
      single: true,
      removeIfExists: true,
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
