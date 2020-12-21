import { FieldType } from 'dynamic-form';
import { FormlyFieldConfig } from '@ngx-formly/core';

function getColor(label: string | any) {
  const _label = typeof label === 'string' ? label : label.label;

  if (!label)
    throw new Error();

  let key = label.key;

  if (!key)
    key = lowerFirstLetter(_label.replaceAll(' ', ''));

  return {
    key,
    name: key,
    type: FieldType.Color,
    templateOptions: { label: _label }
  };
}

function lowerFirstLetter(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function getRadio(key: string, label: string, options: { label: string, value: string }[] | string[]) {
  const _options = (options as Array<any>).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return item;
  });
  return {
    key,
    type: FieldType.Radio,
    templateOptions: { label, options: _options }
  };
}

function getHistogram(key: string = 'orientation', label: string = 'Histogram Orientation'): FormlyFieldConfig {
  return {
    key,
    type: FieldType.Radio,
    className: 'no-underline',
    templateOptions: {
      label,
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]
    }
  };
}

function getTextAlign(key: string = 'textAlign', label = 'Text align') {
  return {
    key,
    type: FieldType.TextAlign,
    templateOptions: {
      label
    }
  };
}

function getCheckboxes(checkboxes: { key: string, label: string }[], label?: string, additionalFields: FormlyFieldConfig[] = []) {
  return {
    wrappers: ['form-field'],
    templateOptions: {
      label
    },
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
    fieldGroup: [...checkboxes.map(item => {
      return {
        key: item.key,
        fieldGroupClassName: 'checkbox-wrapper',
        type: FieldType.Checkbox,
        templateOptions: {
          label: item.label,
          defaultValue: false,
        },
      };
    }), ...additionalFields]
  };
}

function getNumber(key: string, label: string) {
  return {
    key,
    type: FieldType.Number,
    templateOptions: {
      label
    },
  };
}

export const commonFields: FormlyFieldConfig[] = [
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Font'
    },
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
    fieldGroup: [
      {
        type: FieldType.Select,
        templateOptions: {
          options: [{ label: 'Open Sans', value: 'Open Sans' }],
        },
        key: 'fontFamily'
      },
      {
        type: FieldType.Select,
        templateOptions: {
          options: [
            { label: 'Regular', value: 'regular' }, { label: 'Bold', value: 'bold' }, { label: 'Bolder', value: 'bolder' }]
        },
        key: 'fontWeight'
      },
      {
        type: FieldType.Number,
        templateOptions: { label: 'Font size' },
        key: 'fontSize',
      },
    ]
  },
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'General Color'
    },
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
    fieldGroup: [
      getColor('Grid Line Color'),
      getColor('Order Grid Line Color'),
      getColor('Center Line Color'),
      getColor('Simulation Mode Warning Clr'),
    ]
  },
  getCheckboxes([
    { key: 'notes', label: 'Notes' },
    { label: 'Bid Delta', key: 'bidDelta' },
    { label: 'Total At Bid', key: 'totalAtBid' },
    { label: 'Ask Delta', key: 'askDelta' },
    { label: 'Total At Ask', key: 'totalAtAsk' },
    { label: 'Merge Bid/Ask Delta', key: 'mergeDelta' },
    { label: 'Last Traded Quantity(LQT)', key: 'lqt' },
    { label: 'Volume Profile', key: 'volumeProfile' },
    { label: 'Orders', key: 'orders' },
    { label: 'Current Trades At Bit', key: 'currentTradesAtBit' },
    { label: 'Bid Depth', key: 'bidDepth' },
    { label: 'Current Trades At Ask', key: 'currentTradesAtAsk' },
    { label: 'Ask Depth', key: 'askDepth' },
    { label: 'Price', key: 'price' },
  ], 'Columns View'),
];
export const hotkeyFields: FormlyFieldConfig[] = [
  {
    type: FieldType.Input,
    templateOptions: { label: 'Auto Center' },
    key: 'autoCenter',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Auto Center All Windows' },
    key: 'autoCenterWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Buy Market' },
    key: 'buyMarket',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Sell Market' },
    key: 'sellMarket',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Hit Bid' },
    key: 'hitBid',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Join Bid' },
    key: 'joinBid',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Lift Offer' },
    key: 'liftOffer',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'OCO' },
    key: 'oco',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Flatten' },
    key: 'flatten',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Cancel All Orders' },
    key: 'cancelAllOrders',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity 1 Preset' },
    key: 'quantity1',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity 2 Preset' },
    key: 'quantity2',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity 3 Preset' },
    key: 'quantity3',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity 4 Preset' },
    key: 'quantity4',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity 5 Preset' },
    key: 'quantity5',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Quantity to Position Size' },
    key: 'quantityToPos',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Set All Stops to Price' },
    key: 'stopsToPrice',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Alerts' },
    key: 'clearAlerts',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Alerts All Window' },
    key: 'clearAlertsWindow',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear All Totals' },
    key: 'clearTotals',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Current Trades All Windows' },
    key: 'clearCurrentTradesWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Current Trades Down' },
    key: 'clearCurrentTradesDown',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Current Trades Down All Windows' },
    key: 'clearCurrentTradesDownWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Current Trades Up' },
    key: 'clearCurrentTradesUp',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Current Trades Up All Windows' },
    key: 'clearCurrentTradesUpWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Total Trades Down' },
    key: 'clearTotalTradesDown',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Total Trades Down All Windows' },
    key: 'clearTotalTradesDownWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Total Trades Up' },
    key: 'clearTotalTradesUp',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Total Trades Up All Windows' },
    key: 'clearTotalTradesUpWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: { label: 'Clear Volume Profile' },
    key: 'clearVolumeProfile',
  },
];
export const generalFields: FormlyFieldConfig[] = [

  getCheckboxes([
    { key: 'closeOutstandingOrders', label: 'Close Outstanding Orders When Position is Closed' },
    { key: 'clearCurrentTrades', label: 'Clear Current Trades On New Position' },
    { label: 'Clear Total Trades On New Position', key: 'clearTotalTrades' },
    { label: 'Re-Center On New Position', key: 'recenter' },
    { label: 'All Windows', key: 'allWindows' },
  ],
    'Reset settings'),
  getCheckboxes([
    { label: 'Hide Account Name', key: 'hideAccountName' },
    { label: 'Hide From Left', key: 'hideFromLeft' },
    { label: 'Hide From Right', key: 'hideFromRight' },

  ], 'Account Name', [{
    templateOptions: { label: 'Account Digits To Hide', },
    key: 'digitsToHide',
    type: FieldType.Number,
  }]),


  getCheckboxes([
    {
      label: 'Always on Top',
      key: 'onTop',
    },
    {
      label: 'Center Line',
      key: 'centerLine'
    },
    {
      label: 'Reset on new Session',
      key: 'resetOnNewSession'
    },
    {
      label: 'Auto Center',
      key: 'autoCenter',
    },
    {
      label: 'Use Custom Tick Size',
      key: 'useCustomTickSize'
    },
  ], 'Common View', [
    {
      templateOptions: { label: 'Auto Center Ticks' },
      key: 'autoCenterTicks',
      type: FieldType.Number,
    },
    {
      templateOptions: { label: 'Ticks per price' },
      key: 'ticksPerPrice',
      type: FieldType.Number,
    },
  ]),
  {
    wrappers: ['form-field'],
    fieldGroupClassName: 'd-flex two-rows flex-wrap ',
    templateOptions: {
      label: 'Depth & Market'
    },
    fieldGroup: [
      {
        templateOptions: { label: 'Market Depth' },
        key: 'marketDepth',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: 'Bid/Ask Delta Filter' },
        key: 'bidAskDeltaFilter',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: ' Bid/Ask Delta Depth' },
        key: 'bidAskDeltaDepth',
        type: FieldType.Number,
      },
      {
        key: 'showDepthHistory',
        type: FieldType.Checkbox,
        name: 'alwaysOnTop',
        templateOptions: {
          label: 'Show Depth History'
        },
      },
    ]
  },
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Intervals'
    },
    fieldGroupClassName: 'd-flex two-rows flex-wrap ',
    fieldGroup: [
      {
        templateOptions: { label: 'Clear Traders Timer Interval' },
        key: 'clearTradersTimer',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: 'Update Interval' },
        key: 'updateInterval',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: 'Scroll Wheel Sensitivity' },
        key: 'scrollWheelSensitivity',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: 'Order  Quantity Step' },
        key: 'orderQuantityStep',
        type: FieldType.Number,
      },
      {
        templateOptions: { label: 'Momentum Interval ms' },
        key: 'momentumIntervalMs',
        type: FieldType.Number,
      },
      {
        key: 'printOutlines',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Print Outlines'
        },
      },
      {
        key: 'momentumTails',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Momentum Tails'
        },
      },
    ]
  },
];
export const ltqFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Last Traded Quantity (LTQ)'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Font Color'),
    getColor('Background Color'),
    getColor('Buy Background Color'),
    getColor('Sell Background Color'),
    getColor('Highlight Color')]
  },
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    fieldGroup: [getCheckboxes([{ key: 'accumulateTrades', label: 'Accumulate Trades at Price' }]),
    getTextAlign()]
  },
];

export const priceFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Price'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Highlight Background Color'),
    getColor('Last Traded Price Font Color'),
    getColor('Non Traded Price Back Color'),
    getColor('Traded Price Back Color'),
    getColor('Price Font Color'),
    getColor('Non Traded Price Font Color'),]
  },
  getTextAlign(),

];
export const bidDeltaFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Bid Delta'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),]
  },
  getTextAlign(),

];
export const askDeltaFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Ask Delta'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),]
  },
  getTextAlign(),

];
export const bidDepthFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Bid Depth'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),
    getColor('Total Font Color'),
    getCheckboxes([{ key: 'bidDepth', label: 'Bid Depth Histogram' }, {
      key: 'highlightLargeBids',
      label: 'Highlight Large Bids Only'
    }]),
    getNumber('bidSize', 'Large Bid Size'),
    getTextAlign(),
    getHistogram(),
    ]
  },
];
export const askDepthFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Ask Depth'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),
    getColor('Total Font Color'),
    getCheckboxes([{ key: 'askDepth', label: 'Ask Depth Histogram' }, {
      key: 'highlightLargeAsks',
      label: 'Highlight Large Asks Only'
    }]),
    getNumber('askSize', 'Large Bid Size'),
    getTextAlign(),
    getHistogram(),
    ]
  },
];
export const totalAskDepthFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Total At Ask'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),
    getColor('Total Font Color'),
    getCheckboxes([{ key: 'totalAsk', label: 'Total At Ask Histogram' }]),
    getTextAlign(),
    getHistogram(),

    ]
  },

];
export const totalBidDepthFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Total At Bid'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),
    getColor('Total Font Color'),
    getCheckboxes([{ key: 'totalBid', label: 'Total At Bid Histogram' }]),
    getTextAlign(),
    getHistogram(),
    ]
  },

];
export const volumeFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Volume Profile'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Font Color'),
    getColor('Highlight Background Color'),
    getColor('Histogram Color'),
    getColor({ key: 'controlColor', label: 'Point of Control Color' }),
    getColor({ key: 'areaColor', label: 'Value Area Color' }),
    getColor('VWAP Color'),
    ]
  },
  getCheckboxes([
    { key: 'volumeProfile', label: 'Volume Profile Histogram' },
    { key: 'ltq', label: 'Last Traded Qty (LTQ)' },
    { key: 'poc', label: 'Point of Control' },
    { label: 'Value Area', key: 'valueArea' },
    { key: 'VWAP', label: 'VWAP' }
  ]),
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    fieldGroup: [getTextAlign(),
    getHistogram(),
    ]
  },
];
export const orderColumnFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Trade Column'
    },
    wrappers: ['form-field'],
    fieldGroup: [getColor('Background Color'),
    getColor('Highlight Color'),
    getColor('Buy Order Background'),
    getColor('Sell Order Background'),
    getColor('Buy Order Foreground'),
    getColor('Sell Order Foreground'),
    ]
  },

  getCheckboxes([{ key: 'snowPnl', label: 'Show PnL in Column' },
  { key: 'includePnl', label: 'Include Closed PnL' }]),
  getTextAlign(),
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    fieldGroup: [getColor('In Profit Background'),
    getColor('In Profit Foreground'),
    getColor('Loss Background'),
    getColor('Loss Foreground'),
    getColor('Break-even Background'),
    getColor('Break-even Foreground'),
    ]
  },

  getCheckboxes([
    { key: 'overlay', label: 'Overlay orders on the Bid/Ask Delta Column' },
    { key: 'split', label: 'Split order column into Buy Orders and Sell Orders' },
  ]),
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    fieldGroup: [getColor('Buy Orders Column'),
    getColor('Sell Orders Column'),
    ]
  },

];
export const currentAtBidColumnFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Current At Bid'
    },
    wrappers: ['form-field'],
    fieldGroup: [getCheckboxes([{ key: 'histogram', label: 'Current At Bid Histogram' }]),
    getTextAlign(),
    getColor('Level 1'),
    getColor('Level 2'),
    getColor('Level 3'),
    getColor('Level 4'),
    getColor('Level 5'),
    getColor('Level 6'),
    getColor('Level 7'),
    getColor('Level 8'),
    getColor('Tail Inside Bid Fore'),
    getCheckboxes([{ key: 'tailBidBold', label: 'Tail Inside Bid Bold' }]),
    getColor('Background Color'),
    getColor('Font Color'),
    getColor('Inside Bid Background Color'),
    getColor('Highlight Background Color'),
    getColor('Histogram Color'),
    ]
  },

];
export const currentAtAskFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Current At Ask'
    },
    wrappers: ['form-field'],
    fieldGroup: [
      getCheckboxes([{ key: 'histogram', label: 'Current At Ask Histogram' }]),
      getTextAlign(),
      getColor('Level 1'),
      getColor('Level 2'),
      getColor('Level 3'),
      getColor('Level 4'),
      getColor('Level 5'),
      getColor('Level 6'),
      getColor('Level 7'),
      getColor('Level 8'),
      getColor('Tail Inside Ask Fore'),
      getCheckboxes([{ key: 'tailBidBold', label: 'Tail Inside Ask Bold' }]),
      getColor('Background Color'),
      getColor('Font Color'),
      getColor('Inside Ask Background Color'),
      getColor('Highlight Background Color'),
      getColor('Histogram Color'),
    ]
  },

];
export const noteColumnFields: FormlyFieldConfig[] = [
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    templateOptions: {
      label: 'Note'
    },
    wrappers: ['form-field'],
    fieldGroup: [
      getColor('Ask Volume Color'),
      getColor('Bid Volume Color'),
      getColor('Added Orders Color'),
      getColor('Pulled Orders Color'),
      getColor('Background Color'),
      getColor('Font Color'),
      getColor('Highlight Background Color'),
    ]
  },
  getTextAlign(),

];




export enum SettingTab {
  General = 'general',
  Hotkeys = 'hotkeys',
  Columns = 'columns',
  Common = 'common',
  LTG = 'ltg',
  Price = 'price',
  BidDelta = 'bidDelta',
  AskDelta = 'askDelta',
  BidDepth = 'bidDepth',
  AskDepth = 'askDepth',
  TotalAsk = 'totalAsk',
  TotalBid = 'totalBid',
  VolumeProfile = 'volumeProfile',
  OrderColumn = 'order',
  CurrentAtBid = 'currentAtBid',
  Note = 'note',
  CurrentAtAsk = 'currentAtAsk',
  tab = "tab"
}

export const SettingsConfig = {
  [SettingTab.General]: generalFields,
  [SettingTab.Common]: commonFields,
  [SettingTab.Hotkeys]: hotkeyFields,
  [SettingTab.LTG]: ltqFields,
  [SettingTab.Price]: priceFields,
  [SettingTab.BidDelta]: bidDeltaFields,
  [SettingTab.AskDelta]: askDeltaFields,
  [SettingTab.BidDepth]: bidDepthFields,
  [SettingTab.AskDepth]: askDepthFields,
  [SettingTab.TotalAsk]: totalAskDepthFields,
  [SettingTab.TotalBid]: totalBidDepthFields,
  [SettingTab.VolumeProfile]: volumeFields,
  [SettingTab.OrderColumn]: orderColumnFields,
  [SettingTab.CurrentAtBid]: currentAtBidColumnFields,
  [SettingTab.CurrentAtAsk]: currentAtAskFields,
  [SettingTab.Note]: noteColumnFields,
}
