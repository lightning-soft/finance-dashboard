import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';
import { WebSocketService } from './web-socket.service';

export interface ITrade {
  Price: number;
  Timestamp: Date;
  Volume: number;
  Instrument: any;
  AskInfo: any;
  BidInfo: any;
}

export type OnTradeFn = (trades: ITrade) => void;
export type UnsubscribeFn = () => void;

enum WSMessageTypes {
  SUBSCRIBE = 0,
  UNSUBSCRIBE = 1,
}

@Injectable({
  providedIn: 'root'
})
export class LevelOneDataFeedService {

  private _subscriptions = {};
  private _executors: OnTradeFn[] = [];

  constructor(private _webSocketService: WebSocketService) {
    this._webSocketService.on(this._handleTread.bind(this));
  }

  on(fn: OnTradeFn): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(instruments: IInstrument[]) {
    const subscriptions = this._subscriptions;

    for (const { id } of instruments.filter(Boolean)) {
      subscriptions[id] = (subscriptions[id] ?? 0) + 1;
      if (subscriptions[id] === 1) {
        const request = {
          Type: 0, // subscribe
          Instruments: instruments.map(instrument => ({
            Symbol: instrument.symbol,
            Exchange: instrument.exchange,
            ProductCode: null,
          }))
        };

        this._webSocketService.send(request);
      }
    }
  }

  unsubscribe(instruments: IInstrument[]) {
    const subscriptions = this._subscriptions;

    for (const { id } of instruments.filter(Boolean)) {
      subscriptions[id] = (subscriptions[id] ?? 1) - 1;
      if (subscriptions[id] === 0) {
        const request = {
          Type: 1, // unsubscribe
          Instruments: instruments.filter(Boolean).map(instrument => ({
            Symbol: instrument.symbol,
            Exchange: instrument.exchange,
            ProductCode: null,
          }))
        };


        this._webSocketService.send(request);
      }
    }
  }

  private _handleTread(trades) {
    try {
      for (const executor of this._executors)
        executor(JSON.parse(trades.data));
    } catch (error) {
      console.log(error.message);
    }
  }

}

