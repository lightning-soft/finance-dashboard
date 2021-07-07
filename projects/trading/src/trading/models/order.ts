import { IBaseItem, Id, IPaginationParams } from 'communication';
import { IInstrument } from './instrument';
import { IAccount } from './account';

export type OrderAccount = {
  fcmId: string;
  ibId: string;
  id: string;
  name: string;
};

export interface IOrder extends IBaseItem {
  account: OrderAccount;
  averageFillPrice: number;
  triggerPrice: number;
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
  amount?: number;
  price?: number;
  accountId: Id;
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
export const OrderDurationArray = Object.values(OrderDuration);
Object.freeze(OrderDurationArray);

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
  accounts: IAccount[];
  status: OrderStatus;
}

const forbiddenOrders = [OrderStatus.Rejected, OrderStatus.Filled, OrderStatus.Canceled];

export function isForbiddenOrder(order){
  return forbiddenOrders.includes(order.status);
}

export function getPrice(order: IOrder) {
  return isNaN(order.price) ? order.triggerPrice : order.price;
}
