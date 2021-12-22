import { Components } from '../../modules';

export const orderFormOptions = {
  minHeight: 300,
  minWidth: 369,
  height: 300,
  width: 369,
  resizable: false,
  maximizable: false,
};

export const widgetList = [
  {
    icon: 'icon-widget-chart',
    name: 'Chart',
    component: Components.Chart,
    hasInstrument: true,
    hasTemplates: true,
  },
  {
    icon: 'icon-widget-positions',
    name: 'Positions',
    component: Components.Positions,
    options: {
      minWidth: 384,
    },
    hasTemplates: true,
  },
  {
    icon: 'icon-widget-market-watch',
    name: 'MarketWatch',
    component: Components.MarketWatch,
    hasTemplates: true,
  },
  // {
  //   icon: 'icon-widget-watchlist',
  //   name: 'Watchlist',
  //   component: Components.Watchlist
  // },
  {
    icon: 'icon-widget-dom',
    name: 'DOM',
    component: Components.Dom,
    hasInstrument: true,
    options: {
      width: 500,
      minWidth: 470,
    },
    hasTemplates: true,
  },
  {
    icon: 'icon-widget-orders',
    name: 'Orders',
    component: Components.Orders,
    hasTemplates: true,
  },
  {
    icon: 'icon-widget-create-orders',
    name: 'Order Ticket',
    component: Components.OrderForm,
    options: orderFormOptions,
    hasInstrument: true,
  },
  {
    icon: 'icon-account-info',
    name: 'Account Info',
    component: Components.AccountInfo,
    hasTemplates: true,
    options: {
      single: true,
      height: 350,
      width: 700,
      allowPopup: false,
      removeIfExists: true,
      resizable: true,
    },
  }
];

export const bottomWidgetList = [
  {
    icon: 'icon-clock',
    name: 'Session Manager',
    component: Components.SessionManager,
    options: {
      minWidth: 600,
    },
  },
  // {
  //   icon: 'icon-scripting',
  //   name: 'Scripting',
  //   component: Components.Scripting
  // }
];
