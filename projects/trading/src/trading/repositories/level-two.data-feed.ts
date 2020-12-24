import { Injectable } from '@angular/core';
import { OrderSide } from '../models/order';
import { IRealtimeInstrument } from '../models/realtime-instrument';
import { DataFeed } from './data-feed';

export interface L2 {
  timestamp: Date;
  instrument: IRealtimeInstrument;
  orderId: number | string;
  previousPrice: number
  price: number
  side: OrderSide;
  size: number;
}

@Injectable()
export abstract class LevelTwoDataFeed extends DataFeed<any>{
}

