import { Injectable } from '@angular/core';
import { IOrder } from 'trading';
import { RealFeed } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealPositionsFeed extends RealFeed<IOrder>{
  type = RealtimeType.Position;

  // merge(oldItem: IPosition, newItem: IPosition): IPosition {
  //   const realized = oldItem.realized + (newItem.side === Side.Long ? newItem.size : -newItem.size);
  //   const size = Math.abs(realized);
  //   const total = size ? oldItem.price * oldItem.size + newItem.price * newItem.size : 0;
  //   const price = total / (oldItem.size + newItem.size);

  //   const side = (() => {
  //     if (realized > 0) return Side.Long;
  //     if (realized < 0) return Side.Short;
  //     return Side.Closed;
  //   })();

  //   return { ...newItem, price, size, realized, total, side };
  // }
}

