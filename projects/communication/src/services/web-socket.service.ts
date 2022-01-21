import { Injectable } from '@angular/core';
import { Id } from 'communication';
import { IWSListener, IWSListeners, IWSListenerUnsubscribe, WSEventType } from './types';
import { ConenctionWebSocketService } from './connection.web-socket.service';

@Injectable()
export class WebSocketService {
  private _map = new Map<Id, ConenctionWebSocketService>();
  private _listeners: IWSListeners = Object.values(WSEventType).reduce((accum, event) => {
    accum[event] = new Set();
    return accum;
  }, {}) as IWSListeners;

  send(data: any = {}, connectionId: Id): void {
    const service = this._map.get(connectionId);
    if (!service)
      return;

    service.send(data, connectionId);
  }

  on(type: WSEventType, listener: IWSListener): IWSListenerUnsubscribe {
    this._listeners[type].add(listener);

    for (const [key, service] of this._map) {
      service.on(type, listener);
    }

    return () => {
      this._listeners[type].delete(listener);
      for (const [key, service] of this._map) {
        service.off(type, listener);
      }
    };
  }

  register(id: Id, service: any) {
    this._map.set(id, service);

    for (const type in this._listeners) {
      if (this._listeners.hasOwnProperty(type)) {
        const listeners = this._listeners[type];

        for (const listener of listeners)
          service.on(type, listener);
      }
    }
  }

  unregister(id: Id, service: any) {
    if (this._map.get(id) === service)
      this._map.delete(id);
  }
}
