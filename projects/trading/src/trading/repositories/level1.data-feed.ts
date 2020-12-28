import { Injectable } from '@angular/core';
import { IRealtimeInstrument } from '../models/realtime-instrument';
import { DataFeed } from './data-feed';

export interface ITrade {
  timestamp: Date;
  instrument: IRealtimeInstrument;
  askInfo: IInfo;
  bidInfo: IInfo;
  price: number;
  volume: number;
}
export interface IInfo {
  volume: number;
  price: number;
  orderCount: number;
}

@Injectable()
export abstract class Level1DataFeed extends DataFeed<ITrade> {
}

