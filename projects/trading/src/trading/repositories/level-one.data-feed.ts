import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';
import { Feed } from './feed';

export interface ITrade {
  Timestamp: Date;
  Instrument: any;
  AskInfo: IInfo;
  BidInfo: IInfo;
}
export interface IInfo {
  Volume: number;
  Price: number;
  OrderCount: number;
}

@Injectable()
export abstract class LevelOneDataFeed  extends Feed<ITrade>{
  abstract subscribe(instrument: IInstrument);

  abstract unsubscribe(instrument: IInstrument);
}

