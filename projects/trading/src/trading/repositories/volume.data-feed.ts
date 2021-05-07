import { DataFeed } from './data-feed';
import { IInstrument } from '../models';

export interface VolumeData {
  volume: number;
  timestamp: number;
  instrument: IInstrument;
}


export abstract class VolumeDataFeed extends DataFeed<VolumeData> {
}
