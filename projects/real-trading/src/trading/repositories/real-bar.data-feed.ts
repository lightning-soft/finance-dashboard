import { Injectable } from '@angular/core';
import { IInstrument, Bar } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealBarDataFeed extends RealFeed<Bar, IInstrument> {
  type = RealtimeType.Bar;
  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
}

