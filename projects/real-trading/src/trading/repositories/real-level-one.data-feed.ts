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

@Injectable()
export class RealLevelOneDataFeed {

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

  subscribe(data: IInstrument | IInstrument[]) {
    this._sendRequest(WSMessageTypes.SUBSCRIBE, data);
  }

  unsubscribe(data: IInstrument | IInstrument[]) {
    this._sendRequest(WSMessageTypes.UNSUBSCRIBE, data);
  }

  private _sendRequest(type: WSMessageTypes, data: IInstrument | IInstrument[]) {
    const instruments = Array.isArray(data) ? data : [data];

    instruments.forEach(instrument => {
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
    });
  }

  private _handleTread(trades) {
    for (const executor of this._executors) {
      try {
        executor(trades);
      } catch (error) {
        console.error('_handleTread', error);
      }
    }
  }
}

