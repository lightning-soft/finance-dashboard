import { Injectable } from '@angular/core';
import { Side } from '../models/position';
import { IRealtimeInstrument } from '../models/realtime-instrument';
import { DataFeed } from './data-feed';

export interface L2 {
  timestamp: number;
  instrument: IRealtimeInstrument;
  orderId: number;
  previousPrice: number
  price: number
  side: Side;
  size: number;
}

@Injectable()
export abstract class LevelTwoDataFeed extends DataFeed<any>{
}

