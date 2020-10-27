import { IBaseItem } from '../../common';

export interface IInstrument extends IBaseItem {
  symbol: string;
  exchange: string;
  tickSize: number;
}
