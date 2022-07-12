export interface FormSettings {
  includeRealizedPL?: boolean;
  showOrderConfirm?: boolean;
  showCancelConfirm?: boolean;
  roundPL?: boolean;
  showPLInfo?: boolean;
  showOHLVInfo?: boolean;
  showInstrumentChange?: boolean;
  showBracket?: boolean;
  showIcebergButton?: boolean;
  showFlattenButton?: boolean;
  showLiquidateButton?: boolean;
  showCancelButton?: boolean;
  showBuyButton?: boolean;
  showSellButton?: boolean;
}

export interface AmountButton {
  value: number;
  black?: boolean;
}

export interface Tif {
  DAY: boolean;
  FOK: boolean;
  GTC: boolean;
  IOC: boolean;
  default: string;
}

export interface SideOrderSettingsDom {
  buyButtonsBackgroundColor?: string;
  buyButtonsFontColor?: string;
  sellButtonsBackgroundColor?: string;
  sellButtonsFontColor?: string;
  flatButtonsBackgroundColor?: string;
  flatButtonsFontColor?: string;
  cancelButtonBackgroundColor?: string;
  cancelButtonFontColor?: string;
  closePositionFontColor?: string;
  closePositionBackgroundColor?: string;
  icebergFontColor?: string;
  icebergBackgroundColor?: string;
  formSettings?: FormSettings;
  amountButtons?: AmountButton[];
  tif?: Tif;
}

export interface Trading {
  bracketButton?: boolean;
  orderBarUnit: string;
  overlayOrders: boolean;
  split: boolean;
  orderBarLength: number;
  tradingBarUnit: string;
  showOrderConfirm: boolean;
  tradingBarLength: number;
  showCancelConfirm: boolean;
  showWorkingOrders: boolean;
}
export interface OrderAreaSettings {
  font: string;
  enabled: boolean;
  background: string;
}
export interface Settings {
  flatten: OrderAreaSettings;
  cancelButton: OrderAreaSettings;
  icebergButton: OrderAreaSettings;
  buyMarketButton: OrderAreaSettings;
  sellMarketButton: OrderAreaSettings;
  closePositionButton: OrderAreaSettings;
  showLiquidateButton: OrderAreaSettings;
}
export interface AmountButton {
  value: number;
  black?: boolean;
}
export interface OrderArea {
  settings: Settings;
  showOHLVInfo: boolean;
  showPLInfo: boolean;
  roundPL: boolean;
  showInstrumentChange: boolean;
  bracketButton: boolean;
  includeRealizedPL: boolean;
}
export interface BuySell {
  stop: BtnSettings;
  limit: BtnSettings;
  market: BtnSettings;
  stopLimit: BtnSettings;
}
export interface BtnSettings {
  length: number;
  lineType: string;
  lineColor: string;
}
export interface OrdersColors {
  buy: BuySell;
  sell: BuySell;
  ocoStopLimit: string;
  ocoStopOrder: string;
}
export interface TradingItem {
  tif: Tif;
  trading: Trading;
  orderArea: OrderArea;
  ordersColors: OrdersColors;
  formData: { quantity: number; };
  amountButtons: AmountButton[];
}
