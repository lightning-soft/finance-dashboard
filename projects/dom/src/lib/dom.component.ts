import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Column, DataGrid } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { IInstrument, ITrade, LevelOneDataFeed } from 'trading';
import { DomItem } from './dom.item';

export interface DomComponent extends ILayoutNode { }

interface IDomState {
  instrument: IInstrument;
}

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
  styleUrls: ['./dom.component.scss']
})
@LayoutNode()
export class DomComponent implements OnInit, AfterViewInit, IStateProvider<IDomState> {
  columns: Column[] = [
    '_id',
    'orders',
    'ltq',
    'bid',
    'ask',
    'currentTradeAsk',
    'currentTradeBid',
    'totalAtAsk',
    'price',
    'totalAtBid',
    'tradeColumn',
    'volumeProfile',
    'askDelta',
    'bidDelta',
    'askDepth',
    'bidDepth',
  ].map(name => ({ name, visible: true }));


  @ViewChild(DataGrid)
  dataGrid: DataGrid;

  private _instrument: IInstrument;

  public get instrument(): IInstrument {
    return this._instrument;
  }
  public set instrument(value: IInstrument) {
    if (this._instrument?.id == value.id)
      return;

    this._instrument = value;
    this._levelOneDatafeedService.subscribe(value);
  }

  visibleRows = 0;

  items = [];

  private _trade: ITrade;

  constructor(
    private _levelOneDatafeedService: LevelOneDataFeed) {
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
    const t = this;
    this._levelOneDatafeedService.on((trade: ITrade) => this._handleTrade(trade));
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  _handleTrade(trade: ITrade) {
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;
    this._trade = trade;
    this._calculate();

    this.dataGrid.detectChanges();
  }

  private _calculate(move?: number) {
    const itemsCount = this.visibleRows,
      instrument = this.instrument;

    let last = this._trade && this._trade.price;
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
    const tickSize = 0.01; // instrument && instrument.tickSize;
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
      item.updatePrice(last, true);
    }

    while (upIndex >= 0) {
      price = sum(price, tickSize, step);
      if (upIndex >= itemsCount) {
        upIndex--;
        continue;
      }

      item = data[upIndex];
      item.updatePrice(price);
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
      item.updatePrice(price);
      downIndex++;
    }
  }

  handleNodeEvent(name: LayoutNodeEvent) {
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
    const data = this.items;
    const visibleRows = this.visibleRows = this.dataGrid.getVisibleRows();

    if (data.length === visibleRows)
      return;

    if (data.length > visibleRows)
      data.splice(visibleRows, data.length - visibleRows);
    else if (data.length < visibleRows)
      while (data.length <= visibleRows)
        data.push(new DomItem(data.length));

    this.dataGrid.detectChanges();
  }

  saveState?(): IDomState {
    return {
      instrument: this.instrument,
    }
  }

  loadState?(state: IDomState) {
    // for debug purposes
    if (!state)
      state = {} as any;

    if (!state?.instrument)
      state.instrument = {
        id: 'ESZ0',
        symbol: 'ESZ0',
        exchange: 'CME',
        tickSize: 0.01,
      };
    // for debug purposes


    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
  }
}

export function sum(num1, num2, step = 1) {
  step = Math.pow(10, step);
  return (Math.round(num1 * step) + Math.round(num2 * step)) / step;
}
