import {IModules} from './models';

export const Modules = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Positions: 'positions',
  Orders: 'orders',
  OrderForm: 'order-form',
  Accounts: 'accounts'
};

export const Components = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Positions: 'positions',
  Orders: 'orders',
  OrderForm: 'order-form',
  Accounts: 'accounts'
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
];
