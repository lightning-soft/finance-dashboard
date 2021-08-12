import { DataFeed } from './data-feed';
import { IBar } from 'chart';
import { IInstrument } from '../models';

export interface OHLVData extends IBar {
  instrument: IInstrument;
}

export abstract class OHLVFeed extends DataFeed<OHLVData> {
}
