import { Injectable } from '@angular/core';
import { Id } from 'communication';
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

@Injectable({
  providedIn: 'root'
})
export class LevelOneDataFeedService {

  private _subscriptions = {};
  private _executors: OnTradeFn[] = [];

  constructor(private _webSocketService: WebSocketService) {
    this._webSocketService.connection$.subscribe(isConnected => {
      if (isConnected)
        this._webSocketService.on(this._handleTread.bind(this));
    });
  }

  on(fn: OnTradeFn): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(instruments) {
    const subscriptions = this._subscriptions;

    for (const { id } of instruments.filter(Boolean)) {
      subscriptions[id] = (subscriptions[id] ?? 0) + 1;
    }
    this._webSocketService.subscribe(instruments);
  }

  unsubscribe(instruments) {
    const subscriptions = this._subscriptions;

    for (const { id } of instruments.filter(Boolean)) {
      subscriptions[id] = (subscriptions[id] ?? 1) - 1;
      if (subscriptions[id] < 1) this._webSocketService.unsubscribe(id);
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

