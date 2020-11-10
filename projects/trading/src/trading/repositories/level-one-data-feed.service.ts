import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';

export interface ITrade {
  Timestamp: Date;
  Instrument: any;
  AskInfo: IInfo;
  BidInfo: IInfo;
}
export interface IInfo {
  Volume: number;
  Price: number;
  OrderCount: number;
}
export type OnTradeFn = (trades: ITrade) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class LevelOneDataFeedService {

  abstract on(fn: OnTradeFn): UnsubscribeFn;

  abstract  subscribe(instruments: IInstrument[]);

  abstract unsubscribe(instruments: IInstrument[]);
}

