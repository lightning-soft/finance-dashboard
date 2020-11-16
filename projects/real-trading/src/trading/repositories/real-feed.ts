import { Inject, Injectable } from '@angular/core';
import { IBaseItem, WebSocketService } from 'communication';
import { Feed, OnTradeFn, UnsubscribeFn } from 'trading';
import { RealtimeType } from './realtime';

enum WSMessageTypes {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

@Injectable()
export class RealFeed<T, I extends IBaseItem = any> implements Feed<T> {
  type: RealtimeType;
  private _subscriptions = {};
  private _executors: OnTradeFn<T>[] = [];

  constructor(@Inject(WebSocketService) protected _webSocketService: WebSocketService) {
    this._webSocketService.on(this._handleTread.bind(this));
  }

  on(fn: OnTradeFn<T>): UnsubscribeFn {
    this._executors.push(fn);

    return () => {
      this._executors.filter(executor => executor !== fn);
    };
  }

  subscribe(data: I | I[]) {
    this._sendRequest(WSMessageTypes.SUBSCRIBE, data);
  }

  unsubscribe(data: I | I[]) {
    this._sendRequest(WSMessageTypes.UNSUBSCRIBE, data);
  }

  protected _sendRequest(type: WSMessageTypes, data: I | I[]) {
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

  protected _handleTread(data) {
    if (data.type !== this.type)
      return;

    for (const executor of this._executors) {
      try {
        if (data.result)
          executor(data.result);
      } catch (error) {
        console.error('_handleTread', error);
      }
    }
  }
}

