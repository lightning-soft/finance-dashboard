import { MessageTypes } from './enums';
import { Notification } from './notification';
import { AlertType } from 'communication';
import { OrderStatus } from 'trading';
// Need long import otherwise there is circular dependency
import { RealtimeType } from '../../../real-trading/src/trading/repositories/realtime';
import { ConnectionMessageAggregate } from './connection-message.aggregate';

const successConnectionMessage = new ConnectionMessageAggregate();
const failureConnectionMessage = new ConnectionMessageAggregate();

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


export const handlers = {
  DEFAULT: (msg) => {
    if (msg.type === RealtimeType.Delay) {
      return new Notification({
        body: `Check your internet connection. Delay is ${ msg.result.timeDelay / 1000 }s for ${msg.result.connection.name}.`,
        title: 'Connection',
        timestamp: msg.result.now,
        icon: 'notication-default',
      });
    } else if (msg.type === RealtimeType.Activity) {
      return new Notification({
        body: `Connection ${msg.result.connection.name} doesn't emit data. There may be problems with connection.`,
        title: 'Connection',
        timestamp: Date.now(),
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

    const params = { msg, connectionId, icon, type, timestamp };
    if (type === AlertType.LoginComplete)
      return getConnectionNotification(successConnectionMessage, params);

    if (type === AlertType.ConnectionClosed)
      return getConnectionNotification(failureConnectionMessage, params);

    return new Notification({
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
      hoverInfo: msg.result.description,
      body: `${ msg.result.type } ${ msg.result.side } ${ msg.result.quantity } ${ msg.result.instrument.symbol }`,
      icon: 'notifcation-error'
    });
  }
};

function getConnectionNotification(aggregate, { msg, connectionId, icon, type, timestamp }) {
  if (aggregate.hasOwnProperty(`${ connectionId }`)) {
    aggregate[connectionId] = {};
    aggregate.message += `${ msg.result.message }\n`;

    if (aggregate.isFull()) {
      const notification = new Notification({
        body: aggregate.message,
        title: 'Connection',
        icon,
        type,
        timestamp
      });
      aggregate.clear();
      return notification;
    }
    return false;

  }
}

export const reducer = (msg) => {
  const handler = handlers[msg.type] || handlers.DEFAULT;
  return handler(msg);
};
