import { Injectable } from '@angular/core';
import { IOrder } from 'trading';
import { RealFeed } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealPositionsFeed extends RealFeed<IOrder>{
  type = RealtimeType.Order;
}

