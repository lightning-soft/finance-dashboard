import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import * as merge from 'deepmerge';
import { FieldType } from 'dynamic-form';

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

function getHotkey(config: any | string) {
  let label;
  let key;
  if (typeof config === 'string') {
    label = config;
    key = generateKeyFromLabel(config);
  } else {
    label = config.label;
    key = config.key;
  }
  return {
    templateOptions: {
      label
    },
    className: 'mt-3 d-block',
    type: FieldType.Hotkey,
    key,
  };
}

function getHistogramColor(label = 'Histogram Color', key = 'histogramColor') {
  const histogramBackgroundColor = 'rgba(72,149,245,0.3)';
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

function getRadio(key: string, options: { label: string, value: string }[] | string[]) {
  const _options = (options as Array<any>).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return item;
  });
  return {
    key,
    type: FieldType.Radio,
    templateOptions: { options: _options }
  };
}

export enum HistogramOrientation {
  Left = 'left',
  Right = 'right'
}

function wrapFullWidth(configField) {
  return wrapWithClass(configField, 'w-100');
}

function wrapWithClass(configField, className) {
  return { ...configField, className };

}

function getHistogramOrientation(key: string = 'histogramOrientation', label: string = 'Histogram Orientation'): IFieldConfig {
  return {
    key,
    type: FieldType.Radio,
    className: 'no-underline plain-label',
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
    className: 'd-flex align-items-center',
    templateOptions: {
      label
    },
    getCss: (value) => ({ 'text-align': (((value && value[key]) ?? 'left') + ' !important') })
  };
}

function getSwitch(key, label, config = {}) {
  return {
    ...config,
    key,
    type: FieldType.Switch,
    templateOptions: {
      label
    },
  };
}

function getCheckboxes(checkboxes: { key: string, label: string, config?: any }[], label?: string,
  additionalFields: FormlyFieldConfig[] = [], config = {}) {
  return {
    wrappers: ['form-field'],
    templateOptions: {
      label
    },
    fieldGroupClassName: 'd-flex two-rows flex-wrap',
    fieldGroup: [...checkboxes.map(item => {
      const checkboxConfig = item.config || {};
      return {
        key: item.key,
        fieldGroupClassName: 'checkbox-wrapper',
        type: FieldType.Checkbox,
        templateOptions: {
          label: item.label,
          defaultValue: false,
        },
        ...checkboxConfig
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
  return getColor({ key: 'color', label: 'Font Color' });
}

const histogramFields = [
  getColor('Background Color'),
  getFontColor(),
  getHistogramColor(),
  // getColor('Highlight Background Color', (value) => ({ ':hover': { 'background-color': value } })),
];
export const commonFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Font',
    key: 'common',
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
            { label: 'Regular', value: '' }, { label: 'Bold', value: 'bold' }]
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
        key: 'generalColors',
        fieldGroupClassName: 'd-flex two-rows flex-wrap',
        className: 'w-100 ml-0',
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
          { label: 'Volume Profile', key: 'volume' },
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
export const hotkeyFields: IFieldConfig[] = [
  new FieldConfig(
    {
      label: '',
      key: 'hotkeys',
      fieldGroupClassName: 'w-100',
      fieldGroup: [
        getHotkey('Auto Center'),
        getHotkey('Auto Center All Windows'),
        getHotkey('Buy Market '),
        getHotkey('Sell Market'),
        getHotkey('Hit Bid'),
        getHotkey('Join Bid'),

        getHotkey('Lift Offer'),
        getHotkey({ label: 'OCO', key: 'oco' }),
        getHotkey('Flatten'),
        getHotkey('Cancel All Orders'),
        getHotkey({ label: 'Quantity 1 Preset', key: 'quantity1' }),
        getHotkey({ label: 'Quantity 2 Preset', key: 'quantity2' }),
        getHotkey({ label: 'Quantity 3 Preset', key: 'quantity3' }),
        getHotkey({ label: 'Quantity 4 Preset', key: 'quantity4' }),
        getHotkey({ label: 'Quantity 5 Preset', key: 'quantity5' }),
        getHotkey({ label: 'Quantity to Position Size', key: 'quantityToPos' }),
        getHotkey({ label: 'Set All Stops to Price', key: 'stopsToPrice' }),
        getHotkey('Clear Alerts'),
        getHotkey('Clear Alerts All Window'),
        getHotkey('Clear All Totals'),
        getHotkey('Clear Current Trades All Windows'),
        getHotkey('Clear Current Trades Down'),
        getHotkey('Clear Current Trades Down All Windows'),
        getHotkey('Clear Current Trades Up'),
        getHotkey('Clear Current Trades Up All Windows'),
        getHotkey('Clear Total Trades Down'),
        getHotkey('Clear Total Trades Down All Windows'),
        getHotkey('Clear Total Trades Up'),
        getHotkey('Clear Total Trades Up All Windows'),
        getHotkey('Clear Volume Profile'),
      ]
    }
  ),
];
/*export const hotkeyFields: FormlyFieldConfig[] = [
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
    key: 'clearVolume',
  },
];*/
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
    ]
  }),

];

export const ltqFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Last Traded Quantity (LTQ)',
    key: 'ltq',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        fieldGroup: [
          getFontColor(),
          getColor('Sell Background Color'),
          getColor('Background Color'),
          getColor({ label: 'Highlight Color', key: 'highlightColor' }),
          //  getHistogramColor(),
          getColor('Buy Background Color'),
        ]
      },
      ),
      {
        fieldGroupClassName: 'd-flex flex-wrap two-rows',
        fieldGroup: [
          getCheckboxes([{
            key: 'accumulateTrades',
            label: 'Accumulate Trades at Price',
            config: { className: 'w-100' }
          }]),
          wrapWithClass(getTextAlign(), 'd-flex align-items-center m-0 mb-1'),
        ]
      }],
  }),
];

function buttonApplier(selector, value) {
  if (value) {
    const buttonSelector = ` ${selector}, ${selector}:hover, ${selector}:focus, ${selector}:focus-within`;
    return { [buttonSelector]: value };
  }
}

export const orderAreaFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Order Area',
    fieldGroup: [
      getColor('Buy Buttons Background Color', (background) => {
        return buttonApplier('.cxl-buy', { background: `${background}!important` });
      }),
      getColor('Flat Buttons Background Color', (background) => {
        return buttonApplier('.flatten', { background: `${background}!important` });
      }),
      getColor('Buy Buttons Font Color', (color) => {
        return buttonApplier('.cxl-buy', { color });
      }),
      getColor('Flat Button Font Color', (color) => {
        return buttonApplier('.flatten', { color });
      }),
      getColor('Sell Buttons Background Color', (background) => {
        return buttonApplier('.cxl-sell', { background: `${background}!important` });
      }),
      getColor('Cancel Button Background Color', (background) => {
        return buttonApplier('.cxl-all', { background: `${background}!important` });
      }),
      getColor('Sell Buttons Font Color', (color) => {
        return buttonApplier('.cxl-sell', { color });
      }),
      getColor('Cancel Button Font Color', (color) => {
        return buttonApplier('.cxl-all', { color });
      }),
      {
        key: 'formSettings',
        className: 'w-100 ml-1',
        fieldGroup: [
          getCheckboxes([
            { key: 'showInstrumentChange', label: 'Show Instrument Change' },
            { key: 'closePositionButton', label: 'Show Close Position Button' },
            { key: 'showOHLVInfo', label: 'Show OHLV Info' },
            { key: 'showFlattenButton', label: 'Show Flatten Button' },
            { key: 'showIcebergButton', label: 'Show Iceberg Button', config: { className: 'w-100 iceberg-checkbox' } },
          ]),
          wrapWithClass(getCheckboxes([
            { key: 'showPLInfo', label: 'Show PL Info' },
            { key: 'roundPL', label: 'Round PL to whole numbers' },
          ]), 'm-0'),
          wrapWithClass(getSwitch('includeRealizedPL', 'Include Realized Pl',
            { hideExpression: '!model.showPLInfo' }
          ), 'ml-4'),
        ],
      }
    ],
  }),
];
export const priceFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Price',
    fieldGroup: [
      getHightlightColor(),
      getColor({ label: 'Traded Price Back Color', key: 'tradedPriceBackgroundColor' }),
      getColor('Last Traded Price Font Color'),
      getColor({ label: 'Price Font Color', key: 'color' }),
      getColor({ label: 'Non Traded Price Back Color', key: 'backgroundColor' }),
      getColor({ label: 'Non Traded Price Font Color', key: 'nonTradedPriceColor' }),
      wrapWithClass(getTextAlign(), 'mt-2'),
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
        wrapWithClass(getTextAlign(), 'd-flex w-100 ml-0 align-items-center'),
      ]
    }),
  ];
}

const bidAskConfig = (label) => {
  return new FieldConfig({
    label,
    fieldGroup: [
      ...histogramFields,
      getColor('Total Font Color'),
      {
        ...getCheckboxes([
          { key: 'histogramEnabled', label: `${label} Histogram` },
          { key: 'highlightLarge', label: `Highlight Large ${label}s Only` }
        ]),
        className: 'w-100',
      },
      getHistogramOrientation(),
      wrapWithClass(getTextAlign(), 'mt-2'),
      {
        ...getNumber('largeSize', 'Large Bid Size'), className: 'w-100',
      },

    ]
  });
};

export const bidFields: IFieldConfig[] = [bidAskConfig('Bid')];

export const askFields: IFieldConfig[] = [bidAskConfig('Ask')];


function getDepthConfig(label: string) {
  return new FieldConfig({
    label: `${label} Depth`,
    fieldGroup: [
      ...histogramFields,
      getColor('Total Font Color'),
      {
        ...getCheckboxes([
          { key: 'histogramEnabled', label: `${label} Depth Histogram` },
          { key: 'highlightLarge', label: `Highlight Large ${label} Only` }]),
        className: 'w-100',
      },
      getHistogramOrientation(),
      getNumber('largeSize', `Large ${label} Size`),
      getTextAlign(),
    ]
  });
}

export const bidDepthFields: IFieldConfig[] = [getDepthConfig('Bid')];

export const askDepthFields: IFieldConfig[] = [getDepthConfig('Ask')];


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
        getCheckboxes([{ key: 'histogramEnabled', label: label + ' Histogram' }]),
        getTextAlign(),
        getHistogramOrientation(),
      ]
    }),
  ];
}

export const volumeFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Volume Profile',
    key: 'volume',
    // fieldGroupClassName: '',
    fieldGroup: [
      getColor('Background Color'),
      getColor({ key: 'controlColor', label: 'Point of Control Color' }),
      getFontColor(),
      getColor({ key: 'areaColor', label: 'Value Area Color' }),
      getColor('Highlight Background Color'),
      getColor('VWAP Color'),
      getHistogramColor(),
      new FieldConfig({
        className: 'w-100 ',
        fieldGroup: [
          getHistogramOrientation(),
          {
            ...getCheckboxes([
              { key: 'poc', label: 'Point of Control' },
              { label: 'Value Area', key: 'valueArea' },
            ]), fieldGroupClassName: ''
          },
        ]
      }),
      getCheckboxes([
        { key: 'histogramEnabled', label: 'Volume Profile Histogram' },
        { key: 'VWAP', label: 'VWAP' },
        { key: 'ltq', label: 'Last Traded Qty (LTQ)' },
      ], null, [getTextAlign(),], { className: 'w-100 m-0' }),
    ],
  }),

];

export const orderColumnFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Trade Column',
    key: 'order',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
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

        fieldGroup: [
          {
            ...getCheckboxes([{ key: 'snowPnl', label: 'Show PnL in Column' },
            { key: 'includePnl', label: 'Include Closed PnL' }]),
            fieldGroupClassName: ''
          },
          getTextAlign(),
        ]
      }),
      new FieldConfig({
        className: 'mb-0',
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
            ]),
            fieldGroupClassName: '', className: 'w-100'
          },

        ]
      }),
      new FieldConfig({
        fieldGroup: [disableExpression(getColor('Buy Orders Column'), '!model.split'),
        disableExpression(getColor('Sell Orders Column'), '!model.split')]
      })
    ]
  }),
];

function disableExpression(field, expression: string) {
  return {
    ...field, expressionProperties: {
      'templateOptions.disabled': expression,
    }
  };
}

// todo: apply figma design
function getCurrentFields(suffix: string) {
  return [
    new FieldConfig({
      label: `Current At ${suffix}`,
      key: `current${suffix}`,
      fieldGroup: [
        getCheckboxes([{ key: 'histogramEnabled', label: `Current At ${suffix} Histogram` }]),
        getBackgroundColor(),
        new FieldConfig({
          label: 'Tails Background Colors',
          className: 'color-levels',
          fieldGroupClassName: 'current-level',
          fieldGroup: [
            getColor('Level 1'),
            getColor('Level 2'),
            getColor('Level 3'),
            getColor('Level 4'),
            getColor('Level 5'),
            getColor('Level 6'),
            getColor('Level 7'),
            getColor('Level 8'),
          ]
        }),
        new FieldConfig({
          fieldGroupClassName: 'current-level',
          className: 'current-level-item',
          fieldGroup: [
            getFontColor(),
            getColor('Inside Bid Background Color'),
            getHightlightColor(),
            getHistogramColor(),
            getTextAlign(),

          ]
        }),
        new FieldConfig(
          {
            fieldGroupClassName: '',
            className: 'mt-0',
            fieldGroup: [
              getColor('Tail Inside Ask Fore'),
              wrapWithClass(getCheckboxes([{ key: `tailInside${suffix}Fore`, label: `Tail Inside ${suffix} Bold` }]),
                'd-block tail-checkbox'),
            ]
          }
        ),
      ]
    }),
  ];
}

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
      getFontColor(),
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
  OrderArea = 'orderArea',
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
  Volume = 'volume',
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
  [SettingTab.OrderArea]: orderAreaFields,
  [SettingTab.BidDelta]: getDeltaFields('Bid Delta'),
  [SettingTab.AskDelta]: getDeltaFields('Ask Delta'),
  [SettingTab.Ask]: askFields,
  [SettingTab.Bid]: bidFields,
  [SettingTab.BidDepth]: bidDepthFields,
  [SettingTab.AskDepth]: askDepthFields,
  [SettingTab.TotalAsk]: getTotalFields('Total At Ask', 'totalAsk'),
  [SettingTab.TotalBid]: getTotalFields('Total At Bid', 'totalBid'),
  [SettingTab.Volume]: volumeFields,
  [SettingTab.OrderColumn]: orderColumnFields,
  [SettingTab.CurrentAtBid]: getCurrentFields('Bid'),
  [SettingTab.CurrentAtAsk]: getCurrentFields('Ask'),
  [SettingTab.Note]: noteColumnFields,
};

export function getDefaultSettings(value: any = SettingsConfig) {
  if (Array.isArray(value.fieldGroup))
    return getDefaultSettings(value.fieldGroup).reduce((acc, i) => ({ ...acc, ...i }), {});

  if (Array.isArray(value))
    return value.map(getDefaultSettings);

  if (value.default || value.type != null)
    return { [value.key]: value.default };

  const result = {};
  const keys = Object.keys(value);

  for (const key of keys) {
    result[key] = getDefaultSettings(value[key]);
  }

  return result;
}
