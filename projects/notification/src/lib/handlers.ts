import { MessageTypes } from './enums';
import { Notification } from './notification';

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

const errorAlerts = [
  AlertType.ServiceError,
  AlertType.ShutdownSignal,
];
const connectionsErrors = [
  AlertType.ConnectionClosed, AlertType.LoginFailed,
  AlertType.ConnectionBroken,
  AlertType.ForcedLogout,
];
export const handlers = {
  DEFAULT: (msg) => {
  },

  [MessageTypes.CONNECT]: (msg) => {
    let icon;
    if (errorAlerts.includes(msg?.result?.type))
      icon = 'notifcation-error';
    else if (
      [AlertType.ConnectionOpened, AlertType.LoginComplete].includes(msg?.result?.type)
    ) {
      icon = 'notication-connected';
    } else if (connectionsErrors.includes(msg?.result?.type)) {
      icon = 'notication-disconnected';
    } else {
      icon = 'notication-default';
    }

    return new Notification({
      body: msg.result.message,
      type: msg.type,
      title: 'Connection',
      timestamp: msg.result.timestamp,
      icon,
    });
  },
  [MessageTypes.ERROR]: (msg) => {
    return new Notification({
      title: 'Error',
      type: msg.type,
      body: msg.result.value,
      timestamp: msg.result.timestamp,
      icon: 'notifcation-error',
    });
  },

  [MessageTypes.ORDER]: (msg) => {
    if (msg.result.status !== 'Rejected')
      return;

    return new Notification({
      type: msg.type,
      title: `${msg.type} ${msg.result.status}`,
      body: `${msg.result.type} ${msg.result.side} ${msg.result.quantity} ${msg.result.instrument.symbol}`,
      icon: 'notifcation-error'
    });
  }
};

export const reducer = (msg) => {
  const handler = handlers[msg.type] || handlers.DEFAULT;
  return handler(msg);
};
