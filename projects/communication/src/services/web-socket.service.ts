import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

enum WSMessageTypes {
  SUBSCRIBE = 0,
  UNSUBSCRIBE = 1,
}

export interface IWebSocketConfig {
  url: string;
  protocols?: string;
}

export type ConnectionId = number;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private websocket: WebSocket;

  public connection$: Subject<boolean> = new Subject();
  public isConnected = false;

  constructor() { }

  public connect(wsConfig: IWebSocketConfig, onOpen?: () => void) {
    if (this.isConnected) return;

    this.websocket = new WebSocket(wsConfig.url, wsConfig?.protocols);
    this.websocket.onopen = (event: Event) => {
      onOpen();
      this.connection$.next(true);
      this.isConnected = true;
    };

    this.websocket.onclose = (event: Event) => {
      this.isConnected = false;
      this.connection$.next(false);
    };
  }

  public on(cb) {
    this.websocket.onmessage = message => cb(message);
  }

  public subscribe(instruments) {
    const subscribeRequest = {
      Type: WSMessageTypes.SUBSCRIBE,
      Instruments: instruments.filter(Boolean).map(instrument => ({
        Symbol: instrument.symbol,
        Exchange: instrument.exchange,
        ProductCode: null,
      }))
    };

    this._send(subscribeRequest);
  }

  public unsubscribe(instruments) {
    const unsubscribeRequest = {
      Type: WSMessageTypes.UNSUBSCRIBE,
      Instruments: instruments.map(instrument => ({
        Symbol: instrument.symbol,
        Exchange: instrument.exchange,
        ProductCode: null,
      }))
    };

    this._send(unsubscribeRequest);
  }

  private _send(data: any = {}): void {

    if (this.isConnected) {
      this.websocket.send(JSON.stringify(data));
    } else {
      console.error('Send error');
    }
  }
}