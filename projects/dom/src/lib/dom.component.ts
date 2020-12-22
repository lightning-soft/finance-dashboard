import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { IInstrument, ITrade, LevelOneDataFeed, LevelTwoDataFeed } from 'trading';
import { TotalAccomulator } from './accomulators';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomItem } from './dom.item';
import { histogramComponent, HistogramComponent } from './histogram';
import { DomSettings } from './dom-settings/settings';

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
    'currentTradeBid',
    'currentTradeAsk',
    'ask',
    'askDelta',
    'totalAtBid',
    'totalAtAsk',
    'tradeColumn',
    'askDepth',
    'bidDepth',
  ].map(name => ({ name, visible: true }));

  private _acc = new Map<number, TotalAccomulator>();
  private _total = new TotalAccomulator();

  @ViewChild(DataGrid)
  dataGrid: DataGrid;

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

  private _settings: DomSettings = new DomSettings();

  constructor(
    private _levelOneDatafeed: LevelOneDataFeed,
    private _levelTwoDatafeed: LevelTwoDataFeed) {
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  private _getAccamulateTrade(price: number) {
    if (!this._acc.has(price)) {
      this._acc.set(price, new TotalAccomulator());
      // console.log('r', price);
    }
    // const t = Array.from(this._acc.values())

    // console.log(t.filter((i: any) => i.volume != 0).length)
    return this._acc.get(price);
  }

  ngOnInit(): void {
    this._levelOneDatafeed.on((trade: ITrade) => this._handleTrade(trade));
    this._levelTwoDatafeed.on((trade: ITrade) => console.log(trade));
    this.addLinkObserver({
      link: DomSettingsSelector,
      handleLinkData: (settings) => this._settings.merge(settings)
    })
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  _handleTrade(trade: ITrade) {
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;
    this._trade = trade;

    const item = this._getAccamulateTrade(trade.price);
    item.handleTrade(trade);
    this._total.handleTrade(trade);;

    this._calculate();
    this.dataGrid.detectChanges();
  }

  private _calculate(move?: number) {
    const itemsCount = this.visibleRows;

    let trade = this._trade;
    let last = trade && trade.price;
    // level2AskData: HandledL2Quote[] = this.asksQuotes
    //   .filter(it => it.price >= last)
    //   .sort((q1, q2) => q1.price - q2.price || q2.size - q1.size)
    //   .filter((val, index, arr) => arr.findIndex(it => it.price === val.price) === index)
    //   .map(handleLevel1Quote()),

    // level2BidData: HandledL2Quote[] = this.bidsQuotes
    //   .filter(it => it.price <= last)
    //   .sort((q1, q2) => q2.price - q1.price || q2.size - q1.size)
    //   .filter((val, index, arr) => arr.findIndex(it => it.price === val.price) === index)
    //   .map(handleLevel1Quote());

    const scrolledItems = 0// this._scrolledItems
    let centerIndex = Math.floor((itemsCount - 1) / 2) + scrolledItems;
    const tickSize = 0.25; // instrument && instrument.tickSize;
    const step = 2; // instrument && instrument.digits,
    const data: DomItem[] = this.items;
    let upIndex = centerIndex - 1;
    let downIndex = centerIndex + 1;
    let price = last;
    let item: DomItem;

    if (last == null || isNaN(last))
      return;

    if (centerIndex >= 0 && centerIndex < itemsCount) {
      item = data[centerIndex];
      item.updatePrice(last, trade, this._getAccamulateTrade(last), this._total, true);
    }

    while (upIndex >= 0) {
      price = sum(price, tickSize, step);
      if (upIndex >= itemsCount) {
        upIndex--;
        continue;
      }

      item = data[upIndex];
      item.updatePrice(price, trade, this._getAccamulateTrade(price), this._total);
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
      item.updatePrice(price, trade, this._getAccamulateTrade(price), this._total);
      downIndex++;
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    console.log(name);
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
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
}

export function sum(num1, num2, step = 1) {
  step = Math.pow(10, step);
  return (Math.round(num1 * step) + Math.round(num2 * step)) / step;
}
