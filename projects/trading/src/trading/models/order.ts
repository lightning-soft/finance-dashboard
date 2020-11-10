import { IPaginationParams } from 'communication';
import { IBaseItem } from 'communication';

export interface IOrder extends IBaseItem {
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  priceIn: number;
  status: OrderStatus;
  type: OrderType;
  duration: OrderDuration;
}

export enum OrderSide {
  Buy = 'Buy',
  Sell = 'Sell'
}

export enum OrderDuration {
  GTD = 'GTD',
  GTC = 'GTC',
  FOK = 'FOK',
  IOC = 'IOC',
}

export enum OrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopMarket = 'StopMarket',
  StopLimit = 'StopLimit',
  MIT = 'MIT',
  LIT = 'LIT',
}

export enum OrderStatus {
  Pending = 'Pending',
  New = 'New',
  PartialFilled = 'PartialFilled',
  Filled = 'Filled',
  Canceled = 'Canceled',
  Rejected = 'Rejected',
}

export interface IOrderParams extends IPaginationParams {
  status: OrderStatus;
}
