import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommunicationConfig } from '../http';

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
    this._websocket = new WebSocket(url);
    this._websocket.onopen = (event: Event) => {
      if (onOpen)
        onOpen();

      const apiKey = {Id: '03aea4bdf9681c64abdd402d0b3a49dab0c8526c3135b701b3a9d7ad89fd8737'};
      this._websocket.send(JSON.stringify(apiKey));
      this.connection$.next(true);
    };

    this._websocket.onclose = (event: Event) => {
      this.connection$.next(false);
    };

    this._websocket.onmessage = (message) => {
      for (const listener of this._listeners) {
        listener(message);
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
      return;
    }

    this._websocket.send(payload);
  }
}
