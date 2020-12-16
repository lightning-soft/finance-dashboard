import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';
import { Feed } from './feed';

export interface ITrade {
  timestamp: Date;
  instrument: any;
  askInfo: IInfo;
  bidInfo: IInfo;
  price: number;
}
export interface IInfo {
  volume: number;
  price: number;
  orderCount: number;
}

@Injectable()
export abstract class LevelOneDataFeed  extends Feed<ITrade>{
  abstract subscribe(instrument: IInstrument);

  abstract unsubscribe(instrument: IInstrument);
}

