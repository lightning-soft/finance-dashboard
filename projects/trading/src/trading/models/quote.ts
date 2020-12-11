import { IInstrument } from './instrument';

export type PriceInfo = {
    price: number;
    orderCount: number;
    volume: number;
};

export interface IQuote {
    timestamp: Date;
    askInfo: PriceInfo;
    bidInfo: PriceInfo;
    instrument: IInstrument;
    price: number;
    volume: number;
}
