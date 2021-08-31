import { IBaseItem } from 'communication';
import { OrderSide } from 'trading';

export interface IStockChartXInstrument extends IBaseItem {
  symbol: string;
  company: string;
  exchange: string;
  tickSize: number;
  productCode: string;
  description?: string;
  digits?: number;
  precision?: number;
}

export interface IStockChartXTimeFrame {
  interval: number;
  periodicity: string;
}

export enum RequestKind {
  BARS = 'bars',
  MORE_BARS = 'moreBars',
}

export interface IRequest {
  id?: number;
  kind: RequestKind;
  chart?: any;
  instrument?: any;
}

export interface IBarsRequest extends IRequest {
  barCount: number;
  startDate: Date;
  endDate: Date;
  skip: 0;
}

export interface IQuote {
  price: number;
  volume: number;
  date: Date;
  instrument: IStockChartXInstrument;
  tradesCount?: number;
  side?: OrderSide;
}

export interface IStockChartXBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Enum kind of bar actions.
 * @readonly
 * @type {enum}
 * @memberOf StockChartX
 */
export enum BarsUpdateKind {
  TICK,
  NEW_BAR
}
