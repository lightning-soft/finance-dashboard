import { Inject, Injectable } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { IBaseItem, WebSocketService } from 'communication';
import { Feed, OnTradeFn, UnsubscribeFn } from 'trading';
import { RealtimeType } from './realtime';

export enum WSMessageTypes {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  SUBSCRIBE_L2 = 'subscribeL2',
  UNSUBSCRIBE_L2 = 'unsubscribeL2',
}

@Injectable()
export class RealFeed<T, I extends IBaseItem = any> implements Feed<T> {
  type: RealtimeType;
  private _subscriptions = {};
  private _unsubscribeFns = {};
  private _executors: OnTradeFn<T>[] = [];

  subscribeType: WSMessageTypes;
  unsubscribeType: WSMessageTypes;
  private _sucessfullyConected = false;
  private _pendingRequests = [];

  constructor(@Inject(WebSocketService) protected _webSocketService: WebSocketService,
    @Inject(AccountsManager) protected _accountsManager: AccountsManager) {
    this._webSocketService.on(this._handleTrade.bind(this));
    this._webSocketService.connection$.subscribe(conected => !conected && this._clearSubscription());
    this._accountsManager.connections.subscribe(() => {
      const connection = this._accountsManager.getActiveConnection();
      if (!connection || !connection.connected)
        this._clearSubscription();
    });
  }

  protected _clearSubscription() {
    this._sucessfullyConected = false;
    for (const key in this._unsubscribeFns)
      this._unsubscribeFns[key]();

    this._subscriptions = {};
    this._unsubscribeFns = {};
    this._pendingRequests = [];
  }

  on(fn: OnTradeFn<T>): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors = this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(data: I | I[]) {
    this._sendRequest(this.subscribeType, data);
  }

  unsubscribe(data: I | I[]) {
    this._sendRequest(this.unsubscribeType, data);
  }

  private _sendRequest(type: WSMessageTypes, data: I | I[]) {
    const items = Array.isArray(data) ? data : [data];

    items.forEach(item => {
      if (!item) {
        return;
      }

      const subscriptions = this._subscriptions;
      const hash = this._getHash(item);

      if (type === this.subscribeType) {
        subscriptions[hash] = (subscriptions[hash] || 0) + 1;
        if (subscriptions[hash] === 1) {
          const dto = { Instruments: [item], Timestamp: new Date() };
          this._unsubscribeFns[hash] = () => this._webSocketService.send({ Type: this.unsubscribeType, ...dto });
          if (this._sucessfullyConected)
            this._webSocketService.send({ Type: type, ...dto });
          else
            this._pendingRequests.push(() => this._webSocketService.send({ Type: type, ...dto }));
        }
      } else {
        subscriptions[hash] = (subscriptions[hash] || 1) - 1;
        if (subscriptions[hash] === 0) {
          if (this._unsubscribeFns[hash]) {
            this._unsubscribeFns[hash]();
            delete this._unsubscribeFns[hash];
          }
        }
      }
    });
  }

  protected _getHash(instrument: I) {
    const { symbol, exchange } = instrument as any;

    return [symbol, exchange].join('.');
  }

  // protected _getFromHash(hash: string): I {
  //   const [symbol, exchange] = hash.split('.');

  //   return {
  //     symbol,
  //     exchange
  //   } as any;
  // }

  protected _onSucessfulyConnect() {
    this._sucessfullyConected = true;
    this._pendingRequests.forEach(fn => fn());
    this._pendingRequests = [];
  }

  protected _handleTrade(data) {
    const { type, result } = data;

    if (type == 'Message' && result.value == 'Api-key accepted!') {
      this._onSucessfulyConnect();
      return;
    }

    if (type !== this.type || !result || !this._filter(result))
      return;

    const _result = this._map(result);

    for (const executor of this._executors) {
      try {
        executor(_result);
      } catch (error) {
        console.error('_handleTrade', error);
      }
    }
  }

  protected _filter(item: T): boolean {
    return true;
  }

  protected _map(item: T): any {
    return item;
  }

  merge(oldItem: I, newItem: I): I {
    return newItem;
  }
}

