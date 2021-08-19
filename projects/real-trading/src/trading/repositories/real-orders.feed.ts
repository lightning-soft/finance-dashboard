import { Injectable } from '@angular/core';
import { IOrder } from 'trading';
import { RealFeed } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealOrdersFeed extends RealFeed<IOrder> {
  type = RealtimeType.Order;

  protected _map(item: IOrder): any {
    item.description = item.instrument.description ?? '';

    return super._map(item);
  }
}

