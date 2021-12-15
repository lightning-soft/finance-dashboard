import { IBaseItem, Id, IPaginationParams } from 'communication';
import { IInstrument } from './instrument';
import { IAccount } from './account';

export type OrderAccount = {
  fcmId: string;
  ibId: string;
  id: string;
  name: string;
  connectionId?: string;
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
  timestamp?: number;
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
  Stopped = 'Stopped',
}

export interface IOrderParams extends IPaginationParams {
  accounts: IAccount[];
  status: OrderStatus;
}

const forbiddenOrders = [OrderStatus.Rejected, OrderStatus.Filled, OrderStatus.Canceled];

export function isForbiddenOrder(order) {
  return forbiddenOrders.includes(order.status);
}

export function getPrice(order: IOrder) {
  return isNaN(order.price) ? order.triggerPrice : order.price;
}

export function getPriceSpecs(item: IOrder & { amount: number }, price: number, tickSize) {
  const priceSpecs: any = {};
  const multiplier = 1 / tickSize;
  price = (Math.ceil(price * multiplier) / multiplier);
  if ([OrderType.Limit, OrderType.StopLimit].includes(item.type)) {
    priceSpecs.limitPrice = price;
  }
  if ([OrderType.StopMarket, OrderType.StopLimit].includes(item.type)) {
    priceSpecs.stopPrice = price;
  }
  if (item.type === OrderType.StopLimit) {
    const offset = tickSize * item.amount;
    priceSpecs.stopPrice = price + (item.side === OrderSide.Sell ? offset : -offset);
  }
  return priceSpecs;
}

export function getPriceScecsForDuplicate(item: IOrder) {
  const prices: any = {};
  if ([OrderType.Limit, OrderType.StopLimit].includes(item.type)) {
    prices.limitPrice = +item.price;
  }
  if ([OrderType.StopLimit, OrderType.StopMarket].includes(item.type)) {
    prices.stopPrice = +item.triggerPrice;
  }
  return prices;
}
