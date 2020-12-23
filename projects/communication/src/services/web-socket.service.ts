import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { CommunicationConfig } from '../http';
import ReconnectingWebSocket from 'reconnecting-websocket';

export interface IWebSocketConfig {
  url: string;
  protocols?: string;
}

export type IWSListener<T = any> = (message: T) => void;
export type IWSListenerUnsubscribe = () => void;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private _websocket: WebSocket;

  public connection$ = new BehaviorSubject<boolean>(false);

  get connected(): boolean {
    return this.connection$.value;
  }

  private _listeners: IWSListener[] = [];

  constructor(private _config: CommunicationConfig) { }

  connect(onOpen?: () => void) {
    if (this.connection$.value) {
      if (onOpen)
        onOpen();

      return;
    }

    const url = this._config.rithmic.ws.url;
    this._websocket = new ReconnectingWebSocket(url) as any;
    this._websocket.onopen = (event: Event) => {
      if (onOpen)
        onOpen();

      this.connection$.next(true);
    };

    this._websocket.onclose = (event: Event) => {
      this.connection$.next(false);
    };

    this._websocket.onerror = (event: Event) => {
      console.error('soket', event);
    };

    this._websocket.onmessage = (message) => {
      let data;

      try {
        data = JSON.parse(message.data);
      } catch (e) {
        console.error('Parse error', e);
      }

      if (!data)
        return;

      for (const listener of this._listeners) {
        listener(data);
      }
    };
  }

  on(cb): IWSListenerUnsubscribe {
    this._listeners.push(cb);

    return () => this._listeners = this._listeners.filter(l => l !== cb);
  }

  send(data: any = {}): void {
    let payload;
    try {
      payload = JSON.stringify(data);
    } catch (e) {
      console.error(`Parse error`, data);
    }

    if (!this.connected || !payload) {
      console.warn(`Message didn\'t send `, payload);
      this.connection$
        .pipe(filter(i => i), take(1))
        .subscribe((value) => this._websocket.send(payload));
      return;
    }

    this._websocket.send(payload);
  }
}
