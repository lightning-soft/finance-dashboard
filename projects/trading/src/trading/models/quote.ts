import { IInstrument } from './instrument';

export enum QuoteSide {
  Ask = 'Ask',
  Bid = 'Bid',
}

export enum UpdateType {
  Begin = 'Begin',
  Middle = 'Middle',
  End = 'End',
  Solo = 'Solo',
  Undefined = 'Undefined', //best bid/ask
}

export interface IQuote {
  timestamp: number;
  side: QuoteSide;
  instrument: IInstrument;
  price: number;
  volume: number;
  orderCount: number;
  updateType: UpdateType;
}
