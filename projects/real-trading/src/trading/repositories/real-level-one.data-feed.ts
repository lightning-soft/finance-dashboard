import { Injectable } from '@angular/core';
import { WebSocketService } from 'communication';
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

enum WSMessageTypes {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

@Injectable({
  providedIn: 'root'
})
export class RealLevelOneDataFeed {

  private _subscriptions = {};
  private _executors: OnTradeFn[] = [];

  constructor(private _webSocketService: WebSocketService) {
    this._webSocketService.on(this._handleTrades.bind(this));
  }

  on(fn: OnTradeFn): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(instrument: IInstrument) {
    this._sendRequest(WSMessageTypes.SUBSCRIBE, instrument);
  }

  unsubscribe(instrument: IInstrument) {
    this._sendRequest(WSMessageTypes.UNSUBSCRIBE, instrument);
  }

  private _sendRequest(type: WSMessageTypes, instrument: IInstrument) {
    if (!instrument) {
      return;
    }

    const subscriptions = this._subscriptions;
    const { id } = instrument;

    const sendRequest = () => {
      this._webSocketService.send({
        Type: type,
        Instruments: [instrument],
        Timestamp: new Date(),
      });
    };

    switch (type) {
      case WSMessageTypes.SUBSCRIBE:
        subscriptions[id] = (subscriptions[id] || 0) + 1;
        if (subscriptions[id] === 1) {
          sendRequest();
        }
        break;
      case WSMessageTypes.UNSUBSCRIBE:
        subscriptions[id] = (subscriptions[id] || 1) - 1;
        if (subscriptions[id] === 0) {
          sendRequest();
        }
        break;
    }
  }

  private _handleTrades(trades) {
    try {
      for (const executor of this._executors)
        executor(JSON.parse(trades.data));
    } catch (error) {
      console.error(error.message);
    }
  }
}

