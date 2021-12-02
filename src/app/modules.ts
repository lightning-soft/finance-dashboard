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
  NotificationList: 'notification-list',
  SessionManager: 'session-manager',
  MarketWatch: 'market-watch',
  AccountInfo: 'account-info',
};

export enum Components {
  Chart = 'chart',
  ChartSettings = 'chartSettings',
  ChartVolumeSettings = 'customVolumeProfileSettings',
  Indicators = 'indicators',
  Watchlist = 'watchlist',
  Positions = 'positions',
  PositionsSettings = 'positions-settings',
  Orders = 'orders',
  OrdersSetting = 'orders-settings',
  OrderForm = 'order-form',
  Accounts = 'accounts',
  Scripting = 'scripting',
  Settings = 'settings',
  Dom = 'dom',
  DomSettings = 'dom-settings',
  NotificationList = 'notification-list',
  SessionManager = 'session-manager',
  IndicatorList = 'indicatorList',
  OrdersPanel = 'ordersPanel',
  MarketWatch = 'marketWatch',
  MarketWatchSettings = 'market-watch-settings',
  AccountInfo = 'account-info',
  CustomVolumeProfile = 'custom-volume-profile'
}

export const modulesStore: IModules[] = [
  {
    module: Modules.Chart,
    components: [
      Components.Chart,
      Components.Indicators,
      Components.OrdersPanel,
      Components.ChartSettings,
      Components.ChartVolumeSettings
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
      Components.PositionsSettings,
    ]
  },
  {
    module: Modules.Orders,
    components: [
      Components.Orders,
      Components.OrdersSetting,
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
      Components.DomSettings,

    ]
  },
  {
    module: Modules.NotificationList,
    components: [
      Components.NotificationList,
    ]
  },
  {
    module: Modules.SessionManager,
    components: [
      Components.SessionManager,
    ]
  },
  {
    module: Modules.MarketWatch,
    components: [
      Components.MarketWatch,
      Components.MarketWatchSettings,
    ]
  },
  {
    module: Modules.AccountInfo,
    components: [
      Components.AccountInfo
    ],
  }
];
