import { Injectable } from '@angular/core';
import { IInstrument, ITrade } from 'trading';
import { RealFeed } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealLevelOneDataFeed extends RealFeed<ITrade, IInstrument>{
  type = RealtimeType.Quote;
}

