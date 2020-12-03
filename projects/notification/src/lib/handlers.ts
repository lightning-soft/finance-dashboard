import { MessageTypes } from './enums';
import { Notification } from './notification';

export const handlers = {
  DEFAULT: (msg) => {},

  [MessageTypes.CONNECT]: (msg) => {
    if (msg.result.value === 'Disconnected') {
      return new Notification({
        title: msg.result.value,
        type: msg.type,
        body: msg.result.value,
        timestamp: msg.result.timestamp,
        icon: 'icon-datafeed-disconnected'
      });
    }

    if (msg.result.value === 'Connected') {
      return new Notification({
        title: msg.result.value,
        type: msg.type,
        body: msg.result.value,
        timestamp: msg.result.timestamp,
        icon: 'icon-datafeed-connected'
      });
    }
  },

  [MessageTypes.ORDER]: (msg) => {
    if (msg.result.status !== 'Rejected')
      return;

    return new Notification({
      type: msg.type,
      title: `${msg.type} ${msg.result.status}`,
      body: `${msg.result.type} ${msg.result.side} ${msg.result.quantity} ${msg.result.instrument.symbol}`,
      icon: 'icon-order-reject'
    });
  }
};

export const reducer = (msg) => {
  const handler = handlers[msg.type] || handlers.DEFAULT;
  return handler(msg);
};
