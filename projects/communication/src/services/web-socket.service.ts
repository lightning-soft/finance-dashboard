import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { CommunicationConfig } from '../http';
import ReconnectingWebSocket from 'reconnecting-websocket';

export interface IWebSocketConfig {
  url: string;
  protocols?: string;
}

export enum AlertType {
  Undefined = 'Undefined',
  ConnectionOpened = 'ConnectionOpened',
  ConnectionClosed = 'ConnectionClosed',
  ConnectionBroken = 'ConnectionBroken',
  LoginComplete = 'LoginComplete',
  LoginFailed = 'LoginFailed',
  ServiceError = 'ServiceError',
  ForcedLogout = 'ForcedLogout',
  QuietHeartbeat = 'QuietHeartbeat',
  TradingDisabled = 'TradingDisabled',
  TradingEnabled = 'TradingEnabled',
  ShutdownSignal = 'ShutdownSignal',
}

export enum WSEventType {
  Open = 'open',
  Close = 'close',
  Error = 'error',
  Message = 'message',
}

export type IWSListener = (event?: Event) => void;

export type IWSListeners = {
  [key in WSEventType]: IWSListener[];
};

export type IWSEventListeners = {
  [key in WSEventType]: IWSListener;
};

export type IWSListenerSubscribe = (type: WSEventType, listener: IWSListener) => void;
export type IWSListenerUnsubscribe = () => void;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private _websocket: ReconnectingWebSocket;

  public connection$ = new BehaviorSubject<boolean>(false);
  sucessfulyConnected: boolean;

  get connected(): boolean {
    return this.connection$.value;
  }

  private _listeners: IWSListeners;
  private _eventListeners: IWSEventListeners;

  constructor(private _config: CommunicationConfig) {
    this._setListeners();
    this._setEventListeners();
  }

  connect() {
    if (this.connection$.value) {
      return;
    }

    const url = this._config.rithmic.ws.url;

    this._websocket = new ReconnectingWebSocket(url, [], { minReconnectionDelay: 3000 });

    this._addEventListeners();
  }

  reconnect() {
    this._websocket.reconnect();

    this._addEventListeners();
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

  close() {
    this._websocket.close();

    this._removeEventListeners();
  }

  on(type: WSEventType, listener: IWSListener): IWSListenerUnsubscribe {
    this._listeners[type].push(listener);

    return () => {
      this._listeners[type] = this._listeners[type].filter(l => l !== listener);
    };
  }

  private _setListeners() {
    this._listeners = Object.values(WSEventType).reduce((accum, event) => {
      accum[event] = [];
      return accum;
    }, {}) as IWSListeners;
  }

  private _setEventListeners() {
    this._eventListeners = {
      open: (event: Event) => {
        this._executeListeners(WSEventType.Open, event);

        this.connection$.next(true);
      },
      close: (event: CloseEvent) => {
        this._executeListeners(WSEventType.Close, event);

        this.connection$.next(false);
        this.sucessfulyConnected = false;
      },
      error: (event: ErrorEvent) => {
        this._executeListeners(WSEventType.Error, event);

        console.error('soket', event);
      },
      message: (message: MessageEvent) => {
        try {
          const data = JSON.parse(message.data);
          const { type, result } = data;

          if (type == 'Message' && result.value == 'Api-key accepted!') {
            this.sucessfulyConnected = true;
          }

          this._executeListeners(WSEventType.Message, data);
        } catch (e) {
          console.error('Parse error', e);
        }
      },
    };
  }

  private _addEventListeners() {
    this._forEachEventListener((event, listener) => {
      this._websocket.addEventListener(event, listener);
    });
  }

  private _removeEventListeners() {
    this._forEachEventListener((event, listener) => {
      this._websocket.removeEventListener(event, listener);
    });
  }

  private _forEachEventListener(callback: IWSListenerSubscribe) {
    Object.entries(this._eventListeners).forEach(([type, listener]) => {
      callback(type as WSEventType, listener);
    });
  }

  private _executeListeners(type: WSEventType, data?: any) {
    this._listeners[type].forEach(listener => listener(data));
  }
}
