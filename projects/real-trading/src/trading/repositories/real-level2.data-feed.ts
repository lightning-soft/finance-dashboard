import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealLevel2DataFeed extends RealFeed<any, IInstrument>{
  type = RealtimeType.Level2;
  subscribeType = WSMessageTypes.SUBSCRIBE_L2;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE_L2;

  protected _filter(trade) {
    // return !isNaN(trade.askInfo.price) && !isNaN(trade.bidInfo.price);
    return true;
  }
}

