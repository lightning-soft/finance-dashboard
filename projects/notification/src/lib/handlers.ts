import { MessageTypes } from './enums';
import { Notification } from './notification';
import { AlertType } from 'communication';
import { OrderStatus } from 'trading';
// Need long import otherwise there is circular dependency
import { RealtimeType } from '../../../real-trading/src/trading/repositories/realtime';

const timeOffset = 3000;
const notificationSendOffset = 3 * 60 * 1000;
const maxTimeOffset = 10800000; // 3 hours

const connectionMessage = {
  History: null,
  PnL: null,
  message: '',
  TradingSystem: null,
  MarketData: null,
  clear: function () {
    this.History = null;
    this.PnL = null;
    this.TradingSystem = null;
    this.MarketData = null;
    this.message = '';
  },
  isFull: function () {
    return this.History && this.PnL && this.TradingSystem && this.MarketData;
  },
};

const errorAlerts = [
  AlertType.ServiceError,
  AlertType.ShutdownSignal,
];
const connectionsErrors = [
  AlertType.ConnectionClosed, AlertType.LoginFailed,
  AlertType.ConnectionBroken,
  AlertType.ForcedLogout,
];

const connectedAlerts = [AlertType.ConnectionOpened, AlertType.LoginComplete];

let lastSentNotification = 0;

export const handlers = {
  DEFAULT: (msg) => {
    if (msg.type === RealtimeType.Bar)
      return;

    const now = Date.now();
    const timeDelay = now - msg.result.timestamp;
    const hasDelay = timeDelay > timeOffset && timeDelay < maxTimeOffset;
    const shouldSendNtf = now > lastSentNotification + notificationSendOffset;
    if (hasDelay && shouldSendNtf) {
      lastSentNotification = now;
      return new Notification({
        body: `Check your internet connection. Delay is ${ timeDelay / 1000 }s.`,
        title: 'Connection',
        timestamp: now,
        icon: 'notication-default',
      });
    }
  },

  [MessageTypes.CONNECT]: (msg) => {
    const { type, timestamp, connectionId } = msg.result;

    let icon;
    let message;

    if (errorAlerts.includes(type)) {
      icon = 'notifcation-error';
      message = 'Failed to connect';
    } else if (connectedAlerts.includes(type)) {
      icon = 'notication-connected';
      message = msg.result?.message ?? 'Login Complete';
    } else if (connectionsErrors.includes(type)) {
      icon = 'notication-disconnected';
      message = msg.result?.message ?? 'Connection Closed';
    } else {
      icon = 'notication-default';
      message = msg.result.message ?? '';
    }

    if (connectionMessage.hasOwnProperty(`${ connectionId }`)) {
      connectionMessage[connectionId] = {};
      connectionMessage.message += `${msg.result.message}\n`;

      if (connectionMessage.isFull()) {
        const notification = new Notification({
          body: connectionMessage.message,
          title: 'Connection',
          icon,
          type,
          timestamp
        });
        connectionMessage.clear();
        return notification;
      }
      return;

    }


    new Notification({
      body: message,
      type,
      title: 'Connection',
      timestamp,
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
    if (msg.result.status !== OrderStatus.Rejected)
      return;

    return new Notification({
      type: msg.type,
      title: `${ msg.type } ${ msg.result.status }`,
      body: `${ msg.result.type } ${ msg.result.side } ${ msg.result.quantity } ${ msg.result.instrument.symbol }`,
      icon: 'notifcation-error'
    });
  }
};

export const reducer = (msg) => {
  const handler = handlers[msg.type] || handlers.DEFAULT;
  return handler(msg);
};
