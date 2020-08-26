import {IBaseItem} from '../../common';

export interface IOrder extends IBaseItem{
  symbol: string;
  side: OrderSide;
  size: number;
  executed: number;
  price: number;
  priceIn: number;
  status: OrderStatus;
  type: OrderType;
}
export enum OrderSide{
  Buy, Sell
}
export enum OrderType{
  Market,
}
export enum OrderStatus{
  Open, Close
}
