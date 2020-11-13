import { Id, IPaginationParams } from 'communication';
import { IBaseItem } from 'communication';
import { IInstrument } from './instruemnt';

// export interface IOrder extends IBaseItem {
//   accountId: string;
//   symbol: string;
//   exchange: string;
//   side: OrderSide;
//   quantity: number;
//   limitPrice: number;
//   stopPrice: number;
//   status: OrderStatus;
//   type: OrderType;
//   duration: OrderDuration;
// }

export type OrderAccount = {
  fcmId: string;
  ibId: string;
  id: string | number;
  name: string;
};

export interface IOrder extends IBaseItem {
  account: OrderAccount;
  averageFillPrice: number;
  description: string;
  quantity: number;
  filledQuantity: number;
  instrument: IInstrument;
  duration: OrderDuration;
  side: OrderSide;
  status: OrderStatus;
  type: OrderType;
  
  exchange: string;
  symbol: string;
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
  accountId: Id;
  status: OrderStatus;
}
