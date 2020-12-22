import { Injectable } from '@angular/core';
import { IInstrument, ITrade } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealLevelOneDataFeed extends RealFeed<ITrade, IInstrument>{
  type = RealtimeType.Quote;

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.SUBSCRIBE;

  protected _filter(trade: ITrade) {
    return !isNaN(trade.askInfo.price) && !isNaN(trade.bidInfo.price);
  }
}

