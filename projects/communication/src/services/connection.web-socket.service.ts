import { Injectable, Injector } from '@angular/core';
import { Id } from 'communication';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IConnection } from 'trading';
import { CommunicationConfig } from '../http';
import { IWSListener, IWSListeners, IWSListenerUnsubscribe, WSEventType } from './types';
import { WebSocketService } from './web-socket.service';
import { RealtimeType } from '../../../real-trading/src/trading/repositories/realtime';

const delayOffset = 3000;
const notificationSendOffset = 3 * 60 * 1000;
const maxTimeOffset = 10800000; // 3 hours

const inactivityOffset = 2 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class ConenctionWebSocketService {
  connection: IConnection;
  connection$ = new BehaviorSubject<boolean>(false);
  reconnection$ = new Subject<IConnection>();
  lastSentNotification = 0;

  get connected(): boolean {
    return this.connection$.value;
  }

  private _websocket: ReconnectingWebSocket;
  private _listeners: IWSListeners;
  private _eventListeners: { [key in WSEventType]: any };
  private _statistic = {
    messages: 0,
    events: 0,
    startTime: new Date(),
    maxTime: -Infinity,
    minTime: +Infinity,
    time: {},
  };

  private _delayedMessages = [];

  private _lastMessageActivityTime;
  private _inactivityTimeoutId;

  private _lastCheckingTime: number;
  private _lastMsgTime: number;
  private _intervalId: number;

  constructor(
    protected _injector: Injector,
    private _config: CommunicationConfig,
    private _service: WebSocketService,
  ) {
    this._setListeners();
    this._setEventListeners();
    this._setLastCheckDelay();
    this.connection$
      .pipe(filter(i => i))
      .subscribe(() => {
        for (let i = 0; i < this._delayedMessages.length; i++)
          this._websocket.send(this._delayedMessages[i]);
        this._delayedMessages = [];
      });
    this._lastMessageActivityTime = Date.now();
    this.startInactivityTimer(inactivityOffset);
    (window as any).getStats = () => {
      const _statistic = this._statistic;
      const upTime = (Date.now() - _statistic.startTime.getTime()) / 1000;

      return {
        ..._statistic,
        upTime: `${upTime} sec`,
        avarageMessages: `${(_statistic.messages / upTime).toFixed(2)} messages/sec`,
        avarageEvents: `${(_statistic.events / upTime).toFixed(2)} events/sec`,
        eventsInMessages: `${_statistic.events / _statistic.messages} events/sec`,
      };
    };
  }

  startInactivityTimer(timeout) {
    this._inactivityTimeoutId = setTimeout(() => {
      const now = Date.now();
      let newTimeOut;
      if (now >= this._lastMessageActivityTime + timeout) {
        newTimeOut = inactivityOffset - (now - this._lastMessageActivityTime);
        this._executeListeners(WSEventType.Message, {
          type: RealtimeType.Activity,
          result: { connection: this.connection }
        });
        newTimeOut = newTimeOut > (inactivityOffset / 3) ? newTimeOut : inactivityOffset;
      } else
        newTimeOut = inactivityOffset;
      this._lastMessageActivityTime = now;
      clearTimeout(this._inactivityTimeoutId);
      this.startInactivityTimer(newTimeOut);
    }, timeout);
  }


  get(connection: IConnection): ConenctionWebSocketService {
    if (!connection) {
      throw new Error(`Please provide valid connection`);
    }

    const key = connection.id;
    const constructor = this.constructor as any;

    if (!constructor.instances) {
      constructor.instances = new Map<IConnection, any>();
      constructor.instancesCounts = new Map<IConnection, number>();
    }

    if (constructor.instances.has(key)) {
      return constructor.instances.get(key);
    }

    const instance = new ConenctionWebSocketService(
      this._injector,
      this._config,
      this._service
    );
    instance.connection = connection;

    constructor.instances.set(key, instance);

    return instance;
  }

  destroy(connection: IConnection) {
    this.get(connection).close();
    this._service.unregister(this.connection.id, this);
    this.connection$.next(false);
    clearInterval(this._intervalId);
    clearTimeout(this._inactivityTimeoutId);
  }

  connect() {
    if (this.connection$.value) {
      return;
    }

    this._statistic.startTime = new Date();

    const url = this._config.rithmic.ws.url;

    this._websocket = new ReconnectingWebSocket(url, [], { minReconnectionDelay: 3000 });

    this._addEventListeners();
    this._service.register(this.connection.id, this);
  }

  reconnect() {
    this._websocket.reconnect();

    this._addEventListeners();
    this._service.unregister(this.connection.id, this);
  }

  send(data: any = {}, connectionId: Id): void {
    if (this.connection?.id != connectionId)
      return;

    const payload = JSON.stringify(data);

    if (!payload) {
      return;
    }

    if (this.connected) {
      this._websocket.send(payload);
      return;
    }
    this._delayedMessages.push(payload);

    console.warn(`Message didn\'t send `, payload);
  }

  close() {
    if (this._inactivityTimeoutId != null)
      clearTimeout(this._inactivityTimeoutId);
    this._websocket.close();
  }

  on(type: WSEventType, listener: IWSListener): IWSListenerUnsubscribe {
    this._listeners[type].add(listener);

    return () => {
      this._listeners[type].delete(listener);
    };
  }

  off(type: WSEventType, listener: IWSListener) {
    const listeners = this._listeners[type];

    if (listeners)
      listeners.delete(listener);
  }

  private _setListeners() {
    this._listeners = Object.values(WSEventType).reduce((accum, event) => {
      accum[event] = new Set();
      return accum;
    }, {}) as IWSListeners;
  }

  private _setLastCheckDelay() {
    const self = this;
    this._intervalId = setInterval(() => {
      const timeDelay = self._lastCheckingTime - self._lastMsgTime;
      const hasDelay = timeDelay > delayOffset && timeDelay < maxTimeOffset;
      const shouldSendNtf = self._lastCheckingTime > self.lastSentNotification + notificationSendOffset;
     //  console.table({ lastCheckingTime: self.lastCheckingTime, msg: this.lastMsg, timeDelay,  lastMsgTime: self.lastMsgTime });
      if (hasDelay && shouldSendNtf) {
        self.lastSentNotification = self._lastCheckingTime;
        // this.reconnection$.next(this.connection);
        self._executeListeners(WSEventType.Message, { type: RealtimeType.Delay, result: { timeDelay,
            connection: this.connection,
            now: self._lastCheckingTime } });
      }
    }, 500);
  }

  private _setEventListeners() {
    this._eventListeners = {
      open: (event: Event) => {
        this._executeListeners(WSEventType.Open, event);

        this.connection$.next(true);
      },
      close: (event: CloseEvent) => {
        this._executeListeners(WSEventType.Close, event);
        this._removeEventListeners();
        this._setListeners();
        this.connection$.next(false);
      },
      error: (event: ErrorEvent) => {
        this._executeListeners(WSEventType.Error, event);
      },
      message: (event: MessageEvent) => {
        if (!event?.data)
          return;

        let payload: any;
        this._statistic.messages++;

        try {
          payload = JSON.parse(event.data);
        } catch (e) {
          console.error('Parse error', e);
          return;
        }

        if (Array.isArray(payload)) {
          this._statistic.events += payload.length;
          const t0 = window.performance.now();
          for (const item of payload) {
            this._processMessage(item);
          }
          const t1 = window.performance.now();
          const performance = t1 - t0;
          const time = performance.toFixed(0);
          if (!this._statistic.time[time])
            this._statistic.time[time] = 1;
          else
            this._statistic.time[time]++;
          if (performance > this._statistic.maxTime)
            this._statistic.maxTime = performance;
          else if (performance < this._statistic.minTime)
            this._statistic.minTime = performance;
        } else {
          this._processMessage(payload);
          this._statistic.events++;
        }
      },
    };
  }

  _processMessage(payload) {
    if (!payload)
      return;

    const { type, result } = payload;

    if (type == 'Message' && result.value == 'Api-key accepted!') {
      this.connection$.next(true);
    }
    this._checkConnectionDelay(payload);
    this._checkMessageActivity(payload);

    this._executeListeners(WSEventType.Message, payload);
  }

  private _checkConnectionDelay(msg) {
    if (msg.time == null)
      return;

    this._lastCheckingTime = Date.now();
    this._lastMsgTime = msg.time;
  }

  private _checkMessageActivity(msg) {
    this._lastMessageActivityTime = Date.now();
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

  private _forEachEventListener(callback) {
    Object.entries(this._eventListeners).forEach(([type, listener]) => {
      callback(type as WSEventType, listener);
    });
  }

  private _executeListeners(type: WSEventType, data?: any) {
    const items = this._listeners[type];

    for (const listener of items) {
      try {
        listener(data, this.connection.id);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
