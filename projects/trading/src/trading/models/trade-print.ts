import { IInstrument } from './instrument';
import { OrderSide } from './order';

export interface TradePrint {
  instrument: IInstrument;
  price: number;
  side: OrderSide;
  timestamp: number;
  volume: number;
  volumeBuy: number;
  volumeSell: number;
}

export interface IInfo {
  volume: number;
  price: number;
  orderCount: number;
  timestamp: number;
}
