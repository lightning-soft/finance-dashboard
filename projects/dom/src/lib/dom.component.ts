import { Component, OnInit } from '@angular/core';
import { Column } from 'data-grid';
import { ILayoutNode, LayoutNode } from 'layout';
import { ITrade, LevelOneDataFeed } from 'trading';
import { IInstrument } from '../../../trading/src/trading/models/instruemnt';

export interface DomComponent extends ILayoutNode { }

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
})
@LayoutNode()
export class DomComponent implements OnInit {
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

  private _instrument: IInstrument = {
    id: 'ESZ0',
    symbol: 'ESZ0',
    exchange: 'CME',
    tickSize: 0.01,
  };

  public get instrument(): IInstrument {
    return this._instrument;
  }
  public set instrument(value: IInstrument) {
    if (this._instrument?.id == value.id)
      return;

    this._instrument = value;
    this._levelOneDatafeedService.subscribe(value);
  }

  items = [];

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
    });
  }
}
