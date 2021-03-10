import { IInstrument } from './instrument';

export interface Bar {
  instrument: IInstrument;
  timestamp: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
}
