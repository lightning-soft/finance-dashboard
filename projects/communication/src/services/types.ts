import { Id } from 'communication';

export interface IWebSocketConfig {
  url: string;
  protocols?: string;
}

export enum ConnectionId {
  TradingSystem = 'TradingSystem',
  PnL = 'PnL',
  History = 'History',
  MarketData = 'MarketData'
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

export type IWSListener = (event: Event, connectionId: Id) => void;

export type IWSListeners = {
  [key in WSEventType]: Set<IWSListener>;
};

export type IWSEventListeners = {
  [key in WSEventType]: IWSListener;
};

export type IWSListenerUnsubscribe = () => void;

