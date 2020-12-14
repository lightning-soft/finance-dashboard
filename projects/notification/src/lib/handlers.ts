import { MessageTypes } from './enums';
import { Notification } from './notification';

export const handlers = {
  DEFAULT: (msg) => { },

  [MessageTypes.CONNECT]: (msg) => {
    const icon = `icon-datafeed-${msg?.result?.value.toLowerCase()}`

    return new Notification({
      title: msg.result.value,
      type: msg.type,
      body: msg.result.value,
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
      icon: 'icon-some-error',
    });
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
