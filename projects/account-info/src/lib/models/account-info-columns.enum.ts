export enum AccountInfoColumnsEnum {
  AccountBalance = 'accountBalance',
  ClosedPnl = 'closedPnl',
  OpenPnl = 'openPnl',
  CashOnHand = 'cashOnHand',
  Position = 'position',
  BuyQty = 'buyQty',
  SellQty = 'sellQty',
  Name = 'name',
  Currency = 'currency',
  fcmId = 'fcmId',
  IbId = 'ibId',
  LossLimit = 'lossLimit',
  Account = 'account',
  AutoLiquidateThreshold = 'autoLiquidateThreshold',
}

export const accountInfoColumnsArray = Object.values(AccountInfoColumnsEnum);
Object.freeze(accountInfoColumnsArray);
