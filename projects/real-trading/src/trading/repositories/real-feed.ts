import { Inject, Injectable } from '@angular/core';
import { IBaseItem, WebSocketService } from 'communication';
import { Feed, OnTradeFn, UnsubscribeFn } from 'trading';
import { AccountsManager } from 'accounts-manager';
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
  private _executors: OnTradeFn<T>[] = [];

  subscribeType: WSMessageTypes;
  unsubscribeType: WSMessageTypes;

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
    for (const key in this._subscriptions)
      this._sendRequest(this.unsubscribeType, this._subscriptions[key], true);

    this._subscriptions = {};
  }

  on(fn: OnTradeFn<T>): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(data: I | I[]) {
    this._sendRequest(this.subscribeType, data);
  }

  unsubscribe(data: I | I[]) {
    this._sendRequest(this.unsubscribeType, data);
  }

  private _sendRequest(type: WSMessageTypes, data: I | I[], force = false) {
    const items = Array.isArray(data) ? data : [data];

    items.forEach(item => {
      if (!item) {
        return;
      }

      const subscriptions = this._subscriptions;
      const { id } = item;

      const sendRequest = () => {
        this._webSocketService.send({
          Type: type,
          Instruments: [item],
          Timestamp: new Date(),
        });
      };

      if (type === this.subscribeType) {
        subscriptions[id] = (subscriptions[id] || 0) + 1;
        if (force || subscriptions[id] === 1) {
          sendRequest();
        }
      } else {
        subscriptions[id] = (subscriptions[id] || 1) - 1;
        if (force || subscriptions[id] === 0) {
          sendRequest();
        }
      }
    });
  }

  protected _handleTrade(data) {
    const { type, result } = data;

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

