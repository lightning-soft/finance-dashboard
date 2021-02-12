import { IInstrument } from './instrument';

export enum QuoteSide {
  Ask = 'Ask',
  Bid = 'Bid',
}

export interface IQuote {
    timestamp: number;
    side: QuoteSide;
    instrument: IInstrument;
    price: number;
    volume: number;
}
