import { IBaseItem } from 'communication';
import { IInfo } from 'trading';

export interface IOrderBook extends IBaseItem {
  bids: IInfo[];
  asks: IInfo[];
}
