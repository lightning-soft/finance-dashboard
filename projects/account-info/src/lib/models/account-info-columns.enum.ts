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
  availableBuingPower = 'availableBuingPower',
  reservedBuingPower = 'reservedBuingPower',
  usedBuingPower = 'usedBuingPower',
  impliedMarginReserved = 'impliedMarginReserved',
  marginBalance = 'marginBalance',
  reservedMargin = 'reservedMargin',
  IbId = 'ibId',
  LossLimit = 'lossLimit',
  Account = 'account',
  AutoLiquidateThreshold = 'autoLiquidateThreshold',
}

export const accountInfoColumnsArray = Object.values(AccountInfoColumnsEnum);
Object.freeze(accountInfoColumnsArray);
