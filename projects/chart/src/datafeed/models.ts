import { IBaseItem } from 'communication';

export interface IStockChartXInstrument extends IBaseItem {
  symbol: string;
  company: string;
  exchange: string;
  tickSize: number;
  digits?: number;
}

export interface IQuote {
  Ask: number;
  AskSize: number;
  Bid: number;
  BidSize: number;
  Instrument: string;
  Price: number;
  Time: string;
  Volume: number;
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
  count: number;
  endDate?: Date;
  fromDate?: Date;
}

export interface IQuote {
  price: number;
  volume: number;
  date: Date;
  instrument: IStockChartXInstrument;
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
