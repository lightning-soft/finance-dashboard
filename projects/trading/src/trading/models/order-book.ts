import { IBaseItem } from 'communication';
import { IInfo } from '../repositories/level1.data-feed';

export interface IOrderBook extends IBaseItem {
  bids: IInfo[];
  asks: IInfo[];
}
