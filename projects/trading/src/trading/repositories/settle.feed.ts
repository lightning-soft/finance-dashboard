import { DataFeed } from './data-feed';
import { IInstrument } from '../models';

export interface SettleData {
  timestamp: number;
  instrument: IInstrument;
  price: number;
}

export abstract class SettleDataFeed extends DataFeed<SettleData> {
}
