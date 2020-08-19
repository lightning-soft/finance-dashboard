import {IBaseItem} from '../../common';

export interface IOrder extends IBaseItem{
  symbol: string;
  side: string;
  size: number;
  executed: number;
  price: number;
  priceIn: number;
  status: string;
  type: string;
}
