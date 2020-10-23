import { Injectable } from '@angular/core';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

enum WSMessageTypes {
  SUBSCRIBE = 0,
  UNSUBSCRIBE = 1,
}

export interface IWebSocketConfig {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private config: WebSocketSubjectConfig<any>;

  private websocket$: WebSocketSubject<any>;
  private isConnected: boolean;

  constructor() { }

  public setupConnection(wsConfig: IWebSocketConfig) {

    this.config = {
      url: wsConfig.url,
      closeObserver: {
        next: () => {
          this.websocket$ = null;
        }
      },
      openObserver: {
        next: () => {
          this.isConnected = true;
          console.log('WebSocket connected!');
        }
      }
    };

    this.websocket$ = new WebSocketSubject(this.config);
  }

  public on(cb) {
    this.websocket$.subscribe(message => cb(message));
  }

  public subscribe(instruments) {
    const subscribeRequest = {
      Type: WSMessageTypes.SUBSCRIBE,
      Instruments: instruments
    };

    this._sendMessage(subscribeRequest);
  }

  public unsubscribe(instruments) {
    const unsubscribeRequest = {
      Type: WSMessageTypes.UNSUBSCRIBE,
      Instruments: instruments
    };

    this._sendMessage(unsubscribeRequest);
  }

  private _sendMessage(data: any = {}): void {
    if (this.isConnected) {
      this.websocket$.next(data);
    } else {
      console.error('Send error!');
    }
  }
}
