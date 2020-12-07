import { IModules } from 'lazy-modules';

export const Modules = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Positions: 'positions',
  Orders: 'orders',
  OrderForm: 'order-form',
  Accounts: 'accounts',
  Scripting: 'scripting',
  Settings: 'settings',
  Dom: 'dom',
};

export const Components = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Positions: 'positions',
  Orders: 'orders',
  OrderForm: 'order-form',
  Accounts: 'accounts',
  Scripting: 'scripting',
  Settings: 'settings',
  Dom: 'dom',
};

export const modulesStore: IModules[] = [
  {
    module: Modules.Chart,
    components: [
      Components.Chart,
    ]
  },
  {
    module: Modules.Watchlist,
    components: [
      Components.Watchlist,
    ]
  },
  {
    module: Modules.Positions,
    components: [
      Components.Positions,
    ]
  },
  {
    module: Modules.Orders,
    components: [
      Components.Orders,
    ]
  },
  {
    module: Modules.OrderForm,
    components: [
      Components.OrderForm,
    ]
  },
  {
    module: Modules.Accounts,
    components: [
      Components.Accounts,
    ]
  },
  {
    module: Modules.Scripting,
    components: [
      Components.Scripting,
    ]
  },
  {
    module: Modules.Settings,
    components: [
      Components.Settings,
    ]
  },
  {
    module: Modules.Dom,
    components: [
      Components.Dom,
    ]
  },
];
