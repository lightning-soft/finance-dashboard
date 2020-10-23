import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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

  public connection$: Subject<boolean> = new Subject();
  public isConnected = false;

  constructor() { }

  public setupConnection(wsConfig: IWebSocketConfig, onOpen?: () => void) {

    this.config = {
      url: wsConfig.url,
      closeObserver: {
        next: () => {
          this.websocket$ = null;
          console.log('WebSocket connection closed');
        }
      },
      openObserver: {
        next: () => {
          this.isConnected = true;
          this.connection$.next(true);
          if (onOpen)
            onOpen();
          console.log('WebSocket connected!');
        }
      }
    };

    this.websocket$ = new WebSocketSubject(this.config);
    this.websocket$.subscribe();
    this.isConnected = true;
  }

  public on(cb) {
    this.websocket$.subscribe(message => cb(message));
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

    console.log(subscribeRequest);

    this._sendMessage(subscribeRequest);
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

    this._sendMessage(unsubscribeRequest);
  }

  private _sendMessage(data: any = {}): void {
    if (this.isConnected) {
      this.websocket$.next(data);
    } else {
      if (!this.isConnected) {
        this.setupConnection({
          url: 'ws://173.212.193.40:5005/api/market'
        }, () => {
          this._sendMessage(data);
        });
      }
      console.error('Send error!');
    }
  }
}
