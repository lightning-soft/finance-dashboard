import { Injectable } from '@angular/core';
import { IInstrument, TradePrint } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealTradeDataFeed extends RealFeed<TradePrint, IInstrument> {
  type = RealtimeType.TradePrint;
  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
}

