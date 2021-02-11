import { IInstrument } from './instrument';
import { OrderSide } from './order';

export interface IQuote {
    timestamp: number;
    side: OrderSide;
    instrument: IInstrument;
    price: number;
    volume: number;
}
