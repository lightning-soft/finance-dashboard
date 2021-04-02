import { IBaseItem, Id, IPaginationParams } from 'communication';
import { IInstrument } from './instrument';

export type OrderAccount = {
  fcmId: string;
  ibId: string;
  id: string;
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
  ocoOrder?: IOrder;
  iceQuantity?: number;
  price?: number;
  accountId?: string;
  limitPrice?: number;
  stopPrice?: number;
  currentSequenceNumber?: string;
}

export enum OrderSide {
  Buy = 'Buy',
  Sell = 'Sell'
}

export enum OrderDuration {
///  GTD = 'GTD',
  GTC = 'GTC',
  FOK = 'FOK',
  IOC = 'IOC',
  DAY = 'DAY'
}

export enum OrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopMarket = 'StopMarket',
  StopLimit = 'StopLimit',
  // MIT = 'MIT',
  // LIT = 'LIT',
  // ICE = 'ICE'
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
