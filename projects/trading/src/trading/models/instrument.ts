import { IBaseItem } from 'communication';

export interface IInstrument extends IBaseItem {
  symbol: string;
  description: string;
  exchange: string;
  tickSize: number;
  increment?: number; // get one only
  precision?: number; // get one only
}
