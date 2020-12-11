import { IBaseItem } from 'communication';

export interface IInstrument extends IBaseItem {
  symbol: string;
  exchange: string;
  tickSize: number;
}
