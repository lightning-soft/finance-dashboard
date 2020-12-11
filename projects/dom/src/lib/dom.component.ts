import { Component, OnInit } from '@angular/core';
import { Column } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { IInstrument, ITrade, LevelOneDataFeed } from 'trading';
import { DomItem } from './dom.item';

export interface DomComponent extends ILayoutNode { }

interface IDomState {
  instrument: IInstrument;
}

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
})
@LayoutNode()
export class DomComponent implements OnInit, IStateProvider<IDomState> {
  columns: Column[] = [
    'price',
    'orders',
    'ltq',
    'bid',
    'ask',
    'currentTradeAsk',
    'currentTradeBid',
    'totalAtAsk',
    'totalAtBid',
    'tradeColumn',
    'volumeProfile',
    'askDelta',
    'bidDelta',
    'askDepth',
    'bidDepth',
  ].map(name => ({ name, visible: true }));

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

  items = [
    new DomItem(),
  ];

  constructor(private _levelOneDatafeedService: LevelOneDataFeed) {
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
    this._levelOneDatafeedService.on((trade: ITrade) => {
      if (trade.instrument?.symbol !== this.instrument?.symbol) return;

      // this.askPrice = trade.askInfo.price;
      // this.bidPrice = trade.bidInfo.price;
      console.log(trade)
      this.items[0].processTrade(trade);
    });
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
