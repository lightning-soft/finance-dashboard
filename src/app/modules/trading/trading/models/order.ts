import { IBaseItem } from '../../common';

export interface IOrder extends IBaseItem {
  symbol: string;
  side: OrderSide;
  size: number;
  executed: number;
  price: number;
  priceIn: number;
  status: OrderStatus;
  type: OrderType;
}

export enum OrderSide {
  Buy = 'Buy', Sell = 'Sell'
}

export enum OrderType {
  Market = 'Market',
  Else = 'Else'
}

export enum OrderStatus {
  Open = 'Open', Close = 'Close'
}
