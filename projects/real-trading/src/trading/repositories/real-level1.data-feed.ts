import { Injectable } from '@angular/core';
import { IInstrument, IQuote } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealLevel1DataFeed extends RealFeed<IQuote, IInstrument> {
  type = RealtimeType.Quote;

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
}

