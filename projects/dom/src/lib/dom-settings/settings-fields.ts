import { FieldType } from 'dynamic-form';
import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import * as merge from 'deepmerge';

type EjectCssFn = (value: any) => any;

interface IFieldConfig extends FormlyFieldConfig {
  label?: string;
  getCss?: EjectCssFn;
  fieldGroup?: IFieldConfig[];
}

class FieldConfig implements IFieldConfig {
  key?: string;
  fieldGroup?: IFieldConfig[];
  templateOptions?: FormlyTemplateOptions;

  constructor(config: IFieldConfig) {
    Object.assign(this, {
      wrappers: ['form-field'],
      fieldGroupClassName: 'd-flex flex-wrap two-rows',
      templateOptions: {
        label: config.label,
        ...config.templateOptions,
      },
      ...config,
    });
    if (config.key) {
      this.key = config.key as string;
    } else if (this.templateOptions.label) {
      this.key = generateKeyFromLabel(this.templateOptions.label);
    }
  }

  getCss(value: any): any {

    if (this.key && value) {
      return {
        [` .${this.key}`]: this.fieldGroup
          .map(i => i.getCss && i.getCss(value[this.key]))
          .filter(Boolean)
          .reduce((acc, k) => merge(acc, k), {}),
      };
    }
  }
}

function generateKeyFromLabel(label) {
  return lowerFirstLetter((label as string).replace(/ /g, ''));
}

function getHistogramColor(label = 'Histogram Color', key = 'histogramColor') {
  const histogramBackgroundColor = 'rgba(72,149,245,0.7)';
  return {
    key,
    name: key,
    type: FieldType.Color,
    default: histogramBackgroundColor,
    templateOptions: { label },
    getCss: (value) => ({ ' .histogram': { background: (value && value[key]) ?? histogramBackgroundColor } }),
  };
}

function getColor(label: string | any, cssAttrOrFn?: string | EjectCssFn) {
  const _label = typeof label === 'string' ? label : label.label;

  if (!label)
    throw new Error();

  let key = label.key;

  if (!key)
    key = lowerFirstLetter(_label.replace(/ /g, ''));

  if (!cssAttrOrFn)
    cssAttrOrFn = label.attr;

  if (!cssAttrOrFn)
    cssAttrOrFn = label.getCss;

  if (!cssAttrOrFn)
    cssAttrOrFn = _label.replace(/ /g, '-').toLowerCase();

  return {
    key,
    name: key,
    type: FieldType.Color,
    templateOptions: { label: _label },
    getCss: typeof cssAttrOrFn == 'function'
      ? (value) => (cssAttrOrFn as Function)((value && value[key]))
      : (value) => ({ [cssAttrOrFn as string]: (value && value[key]) }),
  };
}

function lowerFirstLetter(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// function getRadio(key: string, label: string, options: { label: string, value: string }[] | string[]) {
//   const _options = (options as Array<any>).map(item => {
//     if (typeof item === 'string') {
//       return { label: item, value: item };
//     }
//     return item;
//   });
//   return {
//     key,
//     type: FieldType.Radio,
//     templateOptions: { label, options: _options }
//   };
// }

export enum HistogramOrientation {
  Left = 'left',
  Right = 'right'
}

function getHistogramOrientation(key: string = 'histogramOrientation', label: string = 'Histogram Orientation'): IFieldConfig {
  return {
    key,
    type: FieldType.Radio,
    className: 'no-underline',
    templateOptions: {
      label,
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]
    },
    getCss: (value) => {
      if (value && value[key] === HistogramOrientation.Right)
        return {
          ' .histogram': {
            right: 0,
            left: 'unset',
          }
        };
    }
  };
}

function getTextAlign(key: string = 'textAlign', label = 'Text align') {
  return {
    key,
    type: FieldType.TextAlign,
    templateOptions: {
      label
    },
    getCss: (value) => ({ 'text-align': (((value && value[key]) ?? 'left') + ' !important') })
  };
}

function getCheckboxes(checkboxes: { key: string, label: string }[], label?: string,
  additionalFields: FormlyFieldConfig[] = [], config = {}) {
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
    }), ...additionalFields],
    ...config,
  };
}

function getNumber(key: string, label: string, important = true, unit = 'px') {
  const suffix = important ? '!important' : '';
  return {
    key,
    type: FieldType.Number,
    templateOptions: {
      label
    },
    getCss: (value) => {
      if (value && value[key])
        return { [key]: (value[key] + unit + suffix) };
    }
  };
}

function getHightlightColor() {
  return getColor('Highlight Background Color', (value) => ({ ':hover': { 'background-color': value } }));
}

function getBackgroundColor() {
  return getColor('Background Color');
}

function getFontColor() {
  return getColor('Font Color');
}

const histogramFields = [
  getColor('Background Color'),
  getColor('Font Color', 'color'),
  getHistogramColor(),
  // getColor('Highlight Background Color', (value) => ({ ':hover': { 'background-color': value } })),
];
export const commonFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Font',
    key: 'data-grid',
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
    fieldGroup: [
      {
        type: FieldType.Select,
        templateOptions: {
          options: [{ label: 'Open Sans', value: 'Open Sans' },
          { label: 'Monospace', value: 'monospace' },
          { label: 'Sans Serif', value: 'sans-serif' }],
        },
        key: 'fontFamily',
        getCss: (value) => {
          if (value && value.fontFamily)
            return { ' table tbody td .data': { 'font-family': value.fontFamily } };
        }
      },
      {
        type: FieldType.Select,
        templateOptions: {
          options: [
            { label: 'Regular', value: '400' }, { label: 'Bold', value: '600' }, { label: 'Bolder', value: '700' }]
        },
        key: 'fontWeight',
        getCss: (value) => {
          if (value && value.fontWeight)
            return { ' table tbody td .data': { 'font-weight': value.fontWeight } };
        }
      },
      {
        type: FieldType.Number,
        templateOptions: { label: 'Font size' },
        key: 'fontSize',
        getCss: (value) => {
          if (value && value.fontSize)
            return { ' table tbody td .data': { 'font-size': value.fontSize + 'px' } };
        }
      },
      new FieldConfig({
        label: 'General Color',
        key: 'data-grid-body',
        fieldGroupClassName: 'd-flex two-rows flex-wrap',
        className: 'w-100',
        fieldGroup: [
          getColor('Grid Line Color', (value) => {
            if (value)
              return { ' td': { border: `1px solid ${value}` } };
          }),
          getColor('Order Grid Line Color'),
          getColor('Center Line Color', (value) => {
            if (value)
              return { ' .center-price td': { 'border-bottom-color': value } };
          }),
          getColor('Simulation Mode Warning Clr'),
        ]
      }),
      {
        ...getCheckboxes([
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
        ], 'Columns View', [], { className: 'w-100' }), className: 'w-100'
      }
    ]
  }),


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
export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    fieldGroupClassName: '',
    key: 'general',
    fieldGroup: [
      getCheckboxes([
        { key: 'closeOutstandingOrders', label: 'Close Outstanding Orders When Position is Closed' },
        { key: 'clearCurrentTrades', label: 'Clear Current Trades On New Position' },
        { label: 'Clear Total Trades On New Position', key: 'clearTotalTrades' },
        { label: 'Re-Center On New Position', key: 'recenter' },
        { label: 'All Windows', key: 'allWindows' },
      ],
        'Reset settings'),
    ]
  }),
  getCheckboxes([
    { label: 'Hide Account Name', key: 'hideAccountName' },
    { label: 'Hide From Left', key: 'hideFromLeft' },
    { label: 'Hide From Right', key: 'hideFromRight' },

  ], 'Account Name', [{
    templateOptions: { label: 'Account Digits To Hide' },
    key: 'digitsToHide',
    type: FieldType.Number,
  }]),

  new FieldConfig({
    label: 'Common View',
    fieldGroup: [
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
    ]
  }),
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
  ]),
  new FieldConfig({
    label: 'Depth & Market',
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
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
  }),
  new FieldConfig({
    label: 'Intervals',
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
  })
];

export const ltqFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Last Traded Quantity (LTQ)',
    key: 'ltq',
    fieldGroup: [
      ...histogramFields,
      getColor('Buy Background Color'),
      getColor('Sell Background Color'),
    ]
  },
  ),
  {
    fieldGroupClassName: 'd-flex flex-wrap two-rows',
    fieldGroup: [
      getCheckboxes([{ key: 'accumulateTrades', label: 'Accumulate Trades at Price' }]),
      getTextAlign(),
    ]
  }
];

export const priceFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Price',
    fieldGroup: [
      getHightlightColor(),
      getColor('Traded Price Back Color'),
      getColor('Last Traded Price Font Color'),
      getColor({ label: 'Price Font Color', key: 'fontColor' }),
      getColor({ label: 'Non Traded Price Back Color', key: 'backgroundColor' }),
      getColor({ label: 'Non Traded Price Font Color', key: 'nonTradedPriceBackColor' }),
      getTextAlign(),
    ]
  }),
];

function getDeltaFields(label: string) {
  return [
    new FieldConfig({
      label,
      fieldGroup: [
        getBackgroundColor(),
        getHightlightColor(),
        getFontColor(),
        getTextAlign(),
      ]
    }),
  ];
}

export const askFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Ask',
    fieldGroup: [
      ...histogramFields,
      {
        ...getTextAlign(), className: 'w-100'
      }
    ]
  }),
];

const bidConfig = (label) => {
  return new FieldConfig({
    label,
    fieldGroup: [
      ...histogramFields,
      getColor('Total Font Color'),
      {
        ...getCheckboxes([{ key: generateKeyFromLabel(label), label: `${label} Histogram` }, {
          key: 'highlightLargeBids',
          label: 'Highlight Large Bids Only'
        }]),
        className: 'w-100',
      },
      getTextAlign(),
      getHistogramOrientation(),
      {
        ...getNumber('font-size', 'Large Bid Size'), className: 'w-100',
      },

    ]
  });
};
export const bidDepthFields: IFieldConfig[] = [
  bidConfig('Bid Depth'),
];
export const bidFields: IFieldConfig[] = [
  bidConfig('Bid'),
];
export const askDepthFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Ask Depth',
    fieldGroup: [
      ...histogramFields,
      getColor('Total Font Color'),
      {
        ...getCheckboxes([{ key: 'askDepth', label: 'Ask Depth Histogram' }, {
          key: 'highlightLargeAsks',
          label: 'Highlight Large Asks Only'
        }]),
        className: 'w-100',
      },
      getNumber('font-size', 'Large Ask Size'),
      getTextAlign(),
      getHistogramOrientation(),
    ]
  }),

];


function getTotalFields(label: string, key: string) {
  return [
    new FieldConfig({
      label,
      key,
      fieldGroup: [
        getBackgroundColor(),
        getHightlightColor(),
        getFontColor(),
        getHistogramColor(),
        getCheckboxes([{ key: 'enableHistogram', label: label + ' Histogram' }]),
        getTextAlign(),
        getHistogramOrientation(),
      ]
    }),
  ];
}


export const volumeFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Volume Profile',
    // fieldGroupClassName: '',
    fieldGroup: [
      ...histogramFields,
      getColor({ key: 'controlColor', label: 'Point of Control Color' }),
      getColor({ key: 'areaColor', label: 'Value Area Color' }),
      getColor('VWAP Color'),

      getCheckboxes([
        { key: 'enableHistogram', label: 'Volume Profile Histogram' },
        { key: 'ltq', label: 'Last Traded Qty (LTQ)' },
        { key: 'poc', label: 'Point of Control' },
        { label: 'Value Area', key: 'valueArea' },
        { key: 'VWAP', label: 'VWAP' }
      ], null, [], { className: 'w-100 m-0' }),
      getTextAlign(),
      getHistogramOrientation(),
    ],
  }),

];

export const orderColumnFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Trade Column',
    fieldGroup: [
      getColor('Background Color'),
      getColor('Highlight Color'),
      getColor('Buy Order Background'),
      getColor('Sell Order Background'),
      getColor('Buy Order Foreground'),
      getColor('Sell Order Foreground'),
    ],
  }),
  new FieldConfig({
    key: 'tradeColumn',
    fieldGroup: [
      getCheckboxes([{ key: 'snowPnl', label: 'Show PnL in Column' },
      { key: 'includePnl', label: 'Include Closed PnL' }]),
      getTextAlign(),
    ]
  }),
  new FieldConfig({
    key: 'tradeColumn',
    fieldGroup: [
      getColor('In Profit Background'),
      getColor('In Profit Foreground'),
      getColor('Loss Background'),
      getColor('Loss Foreground'),
      getColor('Break-even Background'),
      getColor('Break-even Foreground'),
      {
        ...getCheckboxes([
          { key: 'overlay', label: 'Overlay orders on the Bid/Ask Delta Column' },
          { key: 'split', label: 'Split order column into Buy Orders and Sell Orders' },
        ]), className: 'w-100'
      },
      getColor('Buy Orders Column'),
      getColor('Sell Orders Column'),
    ]
  }),
];
export const currentAtBidColumnFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Current At Bid',
    key: 'currentBid',
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
    ...histogramFields,
    getColor('Inside Bid Background Color'),
    getHistogramColor(),
    ]
  }),

];
export const currentAtAskFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Current At Ask',
    key: 'currentAsk',
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
      ...histogramFields,
      getColor('Inside Ask Background Color'),
      getColor('Histogram Color'),
    ]
  })

];
export const noteColumnFields: IFieldConfig[] = [
  new FieldConfig({
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
  }),
  getTextAlign(),

];

export enum SettingTab {
  General = 'general',
  Hotkeys = 'hotkeys',
  Columns = 'columns',
  Common = 'common',
  LTQ = 'ltq',
  Price = 'price',
  BidDelta = 'bidDelta',
  AskDelta = 'askDelta',
  BidDepth = 'bidDepth',
  Ask = 'ask',
  Bid = 'bid',
  AskDepth = 'askDepth',
  TotalAsk = 'totalAsk',
  TotalBid = 'totalBid',
  VolumeProfile = 'volumeProfile',
  OrderColumn = 'order',
  CurrentAtBid = 'currentAtBid',
  Note = 'note',
  CurrentAtAsk = 'currentAtAsk',
  tab = 'tab'
}

export const SettingsConfig = {
  [SettingTab.General]: generalFields,
  [SettingTab.Common]: commonFields,
  [SettingTab.Hotkeys]: hotkeyFields,
  [SettingTab.LTQ]: ltqFields,
  [SettingTab.Price]: priceFields,
  [SettingTab.BidDelta]: getDeltaFields('Bid Delta'),
  [SettingTab.AskDelta]: getDeltaFields('Ask Delta'),
  [SettingTab.BidDepth]: bidDepthFields,
  [SettingTab.Ask]: askFields,
  [SettingTab.Bid]: bidFields,
  [SettingTab.AskDepth]: askDepthFields,
  [SettingTab.TotalAsk]: getTotalFields('Total At Ask', 'totalAsk'),
  [SettingTab.TotalBid]: getTotalFields('Total At Bid', 'totalBid'),
  [SettingTab.VolumeProfile]: volumeFields,
  [SettingTab.OrderColumn]: orderColumnFields,
  [SettingTab.CurrentAtBid]: currentAtBidColumnFields,
  [SettingTab.CurrentAtAsk]: currentAtAskFields,
  [SettingTab.Note]: noteColumnFields,
};

export function getDefaultSettings(value: any = SettingsConfig) {
  if (Array.isArray(value.fieldGroup))
    return getDefaultSettings(value.fieldGroup).reduce((acc, i) => ({ ...acc, ...i }), {});

  if (Array.isArray(value))
    return value.map(getDefaultSettings)

  if (value.default || value.type != null)
    return { [value.key]: value.default };

  const result = {};
  const keys = Object.keys(value);

  for (const key of keys) {
    result[key] = getDefaultSettings(value[key])
  }

  return result;
};
