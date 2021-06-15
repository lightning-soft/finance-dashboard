import { Inject, Injectable, Injector } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { IBaseItem, Id, WebSocketService, WSEventType } from 'communication';
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
  private _subscriptions: {
    [hash: string]: {
      count: number,
      payload: object,
    }
  } = {};
  private _unsubscribeFns = {};
  private _executors: OnTradeFn<T>[] = [];

  subscribeType: WSMessageTypes;
  unsubscribeType: WSMessageTypes;

  private _pendingRequests = [];

  constructor(
    protected _injector: Injector,
    @Inject(WebSocketService) protected _webSocketService: WebSocketService,
    @Inject(AccountsManager) protected _accountsManager: AccountsManager,
  ) {
    this._webSocketService.on(WSEventType.Message, this._handleTrade.bind(this));
  }

  // initConnectionDeps() {
  //   super.initConnectionDeps();

  //   this._webSocketService.on(WSEventType.Message, this._handleTrade.bind(this));
  // }

  on(fn: OnTradeFn<T>): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors = this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(data: I | I[], connectionId: Id) {
    this._sendRequest(this.subscribeType, data, connectionId);
  }

  unsubscribe(data: I | I[], connectionId: Id) {
    this._sendRequest(this.unsubscribeType, data, connectionId);
  }

  private _sendRequest(type: WSMessageTypes, data: I | I[], connectionId: Id) {
    const items = Array.isArray(data) ? data : [data];

    items.forEach(item => {
      if (!item) {
        return;
      }

      const subscriptions = this._subscriptions;
      const hash = this._getHash(item);

      if (type === this.subscribeType) {
        if (!subscriptions[hash]?.hasOwnProperty('count'))
          subscriptions[hash] = {} as any;
        subscriptions[hash].count = (subscriptions[hash]?.count || 0) + 1;
        if (subscriptions[hash].count === 1) {
          const dto = { Value: [item], Timestamp: new Date() };
          this._unsubscribeFns[hash] = () => this._webSocketService.send({ Type: this.unsubscribeType, ...dto }, connectionId);
          subscriptions[hash].payload = dto;
          // if (this.connection?.connected)
          this._webSocketService.send({ Type: type, ...dto }, connectionId);
          // else
          //   this.createPendingRequest(type, dto);
        }
      } else {
        if (!subscriptions[hash])
          return;
        subscriptions[hash].count = (subscriptions[hash]?.count || 1) - 1;
        if (subscriptions[hash].count === 0) {
          if (this._unsubscribeFns[hash]) {
            this._unsubscribeFns[hash]();
            delete this._unsubscribeFns[hash];
          }
        }
      }
    });
  }

  // private createPendingRequest(type, payload) {
  //   this._pendingRequests.push(() => this.send({ Type: type, ...payload }));
  // }

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
    this._pendingRequests.forEach(fn => fn());
    this._pendingRequests = [];
  }

  protected _handleTrade(data, connectionId: Id): boolean {
    const { type, result } = data;

    if (type == 'Message' && result.value == 'Api-key accepted!') {
      this._onSucessfulyConnect();
      return;
    }

    if (type !== this.type || !result || !this._filter(result))
      return;

    const _result = this._getResult(data);

    for (const executor of this._executors) {
      try {
        executor(_result, connectionId);
      } catch (error) {
        console.error('_handleTrade', error);
      }
    }
    return true;
  }

  protected _getResult(data) {
    const { result } =  data;
    return this._map(result);
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

