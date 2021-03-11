import {
  FieldType, getCheckboxes, getTextAlign, wrapWithClass, getSwitch, generateKeyFromLabel, getHistogramOrientation,
  getColor, getHistogramColor, IFieldConfig, FieldConfig, getHotkey, getNumber
} from 'dynamic-form';
import { wrapWithConfig } from 'projects/dynamic-form';


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
        ...getCheckboxes(
          {
            checkboxes: [
              { key: 'notes', label: 'Notes' },
              { label: 'Bid Delta', key: 'bidDelta' },
              { label: 'Total At Bid', key: 'totalBid' },
              { label: 'Ask Delta', key: 'askDelta' },
              { label: 'Total At Ask', key: 'totalAsk' },
              // { label: 'Merge Bid/Ask Delta', key: 'mergeDelta' },
              { label: 'Last Traded Quantity(LQT)', key: 'ltq' },
              { label: 'Volume Profile', key: 'volume' },
              { label: 'Orders', key: 'orders' },
              // { label: 'Current Trades At Bit', key: 'currentTradesAtBit' },
              { label: 'Bid Depth', key: 'bid' },
              // { label: 'Current Trades At Ask', key: 'currentTradesAtAsk' },
              { label: 'Ask Depth', key: 'ask' },
              { label: 'Price', key: 'price' },
              { label: 'Сurrent Ask', key: 'currentAsk' },
              { label: 'Сurrent Bid', key: 'currentBid' },
            ], label: 'Columns View', extraConfig: { className: 'w-100' }
          }), className: 'w-100'
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
        getHotkey('Join Ask'),
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
        getHotkey({ label: 'Set All Limits to Price', key: 'stopsToLimit' }),
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

export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    fieldGroupClassName: '',
    key: 'general',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          { key: 'closeOutstandingOrders', label: 'Close Outstanding Orders When Position is Closed' },
          { key: 'clearCurrentTrades', label: 'Clear Current Trades On New Position' },
          { label: 'Clear Total Trades On New Position', key: 'clearTotalTrades' },
          { label: 'Re-Center On New Position', key: 'recenter' },
          { label: 'All Windows', key: 'allWindows' },
        ],
        label: 'Reset settings'
      }),
      getCheckboxes({
        checkboxes: [
          { label: 'Hide Account Name', key: 'hideAccountName' },
          { label: 'Hide From Left', key: 'hideFromLeft' },
          { label: 'Hide From Right', key: 'hideFromRight' },

        ], label: 'Account Name', additionalFields: [{
          templateOptions: {   min: 0, label: 'Account Digits To Hide' },
          key: 'digitsToHide',
          type: FieldType.Number,
        }]
      }),
      new FieldConfig({
        label: 'Common View',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              // {
              //   label: 'Always on Top',
              //   key: 'onTop',
              // },
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
            ], extraConfig: { className: 'w-100' }
          }),
          {
            templateOptions: { label: 'Auto Center Ticks' },
            key: 'autoCenterTicks',
            className: 'ml-0 mr-0',
            type: FieldType.Number,
          },
          getCheckboxes({
            checkboxes: [{
              label: 'Use Custom Tick Size',
              key: 'useCustomTickSize',
              config: { className: 'm-0' }
            }],
            extraConfig: {
              fieldGroupClassName: '',
              className: 'mr-0 ml-2 custom-tick-size d-flex align-items-center',
              wrappers: [],
            },
          }),
          {
            templateOptions: {
              min: 0,
              step: 0.25,
              label: 'Ticks per price'
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.useCustomTickSize',
            },
            className: 'ticks-per-price',
            key: 'ticksPerPrice',
            type: FieldType.Number,
          },
        ]
      }),

      new FieldConfig({
        label: 'Depth & Market',
        key: 'marketDepth',
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
            templateOptions: { label: 'Clear Trades Timer Interval' },
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
          getCheckboxes({
            checkboxes: [{
              key: 'accumulateTrades',
              label: 'Accumulate Trades at Price',
              config: { className: 'w-100' }
            }]
          }),
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
          getCheckboxes({
            checkboxes: [
              { key: 'showInstrumentChange', label: 'Show Instrument Change' },
              { key: 'closePositionButton', label: 'Show Close Position Button' },
              { key: 'showOHLVInfo', label: 'Show OHLV Info' },
              { key: 'showFlattenButton', label: 'Show Flatten Button' },
              {
                key: 'showIcebergButton',
                label: 'Show Iceberg Button',
                config: { className: 'w-100 iceberg-checkbox' }
              },
            ]
          }),
          wrapWithClass(getCheckboxes({
            checkboxes: [
              { key: 'showPLInfo', label: 'Show PL Info' },
              { key: 'roundPL', label: 'Round PL to whole numbers' },
            ]
          }), 'm-0'),
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
      getColor({ label: 'Highlight Background Color', key: 'highlightBackgroundColor' }),
      getColor({ label: 'Last Traded Price Font Color', key: 'highlightColor' }),
      getColor({ label: 'Non Traded Price Back Color', key: 'backgroundColor' }),
      getColor({ label: 'Non Traded Price Font Color', key: 'color' }),
      getColor({ label: 'Traded Price Back Color', key: 'tradedPriceBackgroundColor' }),
      getColor({ label: 'Price Font Color', key: 'color' }),
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

// const bidAskConfig = (label) => {
//   return new FieldConfig({
//     label,
//     fieldGroup: [
//       ...histogramFields,
//       getColor('Total Font Color'),
//       {
//         ...getCheckboxes({checkboxes: [
//           { key: 'histogramEnabled', label: `${label} Histogram` },
//           { key: 'highlightLarge', label: `Highlight Large ${label}s Only` }
//         ]}),
//         className: 'w-100',
//       },
//       getHistogramOrientation(),
//       wrapWithClass(getTextAlign(), 'mt-2'),
//       {
//         ...getNumber({ key: 'largeSize', label: 'Large Bid Size' }), className: 'w-100',
//       },

//     ]
//   });
// };

// export const bidFields: IFieldConfig[] = [bidAskConfig('Bid')];

// export const askFields: IFieldConfig[] = [bidAskConfig('Ask')];


function getDepthConfig(label: string) {
  return new FieldConfig({
    label: `${label} Depth`,
    key: label.toLowerCase(),
    fieldGroup: [
      getColor('Background Color'),
      getFontColor(),
      getHistogramColor('Highlight Color'),
      getColor('Total Font Color'),
      {
        ...getCheckboxes({
          checkboxes: [
            { key: 'histogramEnabled', label: `${label} Depth Histogram` },
            { key: 'highlightLarge', label: `Highlight Large ${label} Only` }]
        }),
        className: 'w-100',
      },
    /*  getNumber({ key: 'font-size', label: 'Large Ask Size' }),
      getTextAlign(),*/
      getHistogramOrientation(),
      getNumber({ key: 'largeSize', label: `Large ${label} Size` }),
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
        getCheckboxes({ checkboxes: [{ key: 'histogramEnabled', label: label + ' Histogram' }] }),
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
      getColor({ key: 'pointOfControlHistogramColor', label: 'Point of Control Color' }),
      getFontColor(),
      getColor({ key: 'valueAreaHistogramColor', label: 'Value Area Color' }),
      getColor('Highlight Background Color'),
      getColor({ key: 'VWAPHistogramColor', label: 'VWAP Color', }),
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
      getCheckboxes({
        checkboxes: [
          { key: 'histogramEnabled', label: 'Volume Profile Histogram' },
          { key: 'VWAP', label: 'VWAP' },
          { key: 'ltq', label: 'Last Traded Qty (LTQ)' },
        ], extraConfig: { className: 'w-100 m-0' }, additionalFields: [getTextAlign()]
      }),


      /*  getCheckboxes({
          checkboxes: [
            { key: 'enableHistogram', label: 'Volume Profile Histogram' },
            { key: 'ltq', label: 'Last Traded Qty (LTQ)' },
            { key: 'poc', label: 'Point of Control' },
            { label: 'Value Area', key: 'valueArea' },
            { key: 'VWAP', label: 'VWAP' }
          ], extraConfig: { className: 'w-100 m-0' }
        }),
        getTextAlign(),
        getHistogramOrientation(),*/
    ],
  }),

];

export const orderColumnFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Trade Column',
    key: 'orders',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        fieldGroup: [
          getColor('Background Color'),
          getColor('Highlight Color'),
          getColor({ label: 'Buy Order Background', key: 'buyOrderBackgroundColor' }),
          getColor({ label: 'Sell Order Background', key: 'sellOrderBackgroundColor' }),
          getColor({ label: 'Buy Order Foreground', key: 'buyOrderColor' }),
          getColor({ label: 'Sell Order Foreground', key: 'sellOrderColor' }),
        ],
      }),
      new FieldConfig({
        fieldGroup: [
          {
            ...getCheckboxes({checkboxes: [{ key: 'showPnl', label: 'Show PnL in Column' },
              { key: 'includePnl', label: 'Include Closed PnL' }]}),
            fieldGroupClassName: '',
            className: 'pl-1',
          },
          getTextAlign(),
        ]
      }),
      new FieldConfig({
        className: 'mb-0',
        fieldGroup: [
          getColor({ label: 'In Profit Background', key: 'inProfitBackgroundColor' }),
          getColor({ label: 'In Profit Foreground', key: 'inProfitColor' }),
          getColor({ label: 'Loss Background', key: 'lossBackgroundColor' }),
          getColor({ label: 'Loss Foreground', key: 'lossColor' }),
          getColor({ label: 'Break-even Background', key: 'break-evenBackgroundColor' }),
          getColor({ label: 'Break-even Foreground', key: 'break-evenForegroundColor' }),
          {
            ...getCheckboxes({
              checkboxes: [
                { key: 'overlay', label: 'Overlay orders on the Bid/Ask Delta Column' },
                { key: 'split', label: 'Split order column into Buy Orders and Sell Orders' },
              ]
            }),
            fieldGroupClassName: '', className: 'w-100 m-0 pl-1'
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
        getCheckboxes({ checkboxes: [{ key: 'histogramEnabled', label: `Current At ${suffix} Histogram` }] }),
        getBackgroundColor(),
        wrapWithConfig(new FieldConfig({
          label: 'Tails Background Colors',
          className: 'color-levels',
          fieldGroupClassName: 'current-level',
          fieldGroup: [1, 2, 3, 4, 5, 6, 7, 8]
            .map(i => getColor({ label: `Level ${i}`, key: `level${i}BackgroundColor` })),
        }), {key: null}),
        new FieldConfig({
          fieldGroupClassName: 'current-level',
          className: 'current-level-item',
          fieldGroup: [
            getFontColor(),
            getColor({ label: `Inside ${suffix} Background Color`, key: 'insideBackgroundColor' }),
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
              getColor({ label: `Tail Inside ${suffix} Fore`, key: 'tailInsideColor' }),
              wrapWithClass(getCheckboxes({
                  checkboxes: [{
                    key: `tailInsideBold`,
                    label: `Tail Inside ${suffix} Bold`
                  }]
                }),
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
  // BidDepth = 'bidDepth',
  Ask = 'ask',
  Bid = 'bid',
  // AskDepth = 'askDepth',
  TotalAsk = 'totalAsk',
  TotalBid = 'totalBid',
  Volume = 'volume',
  Orders = 'orders',
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
  // [SettingTab.Ask]: askFields,
  // [SettingTab.Bid]: bidFields,
  [SettingTab.Bid]: bidDepthFields,
  [SettingTab.Ask]: askDepthFields,
  [SettingTab.TotalAsk]: getTotalFields('Total At Ask', 'totalAsk'),
  [SettingTab.TotalBid]: getTotalFields('Total At Bid', 'totalBid'),
  [SettingTab.Volume]: volumeFields,
  [SettingTab.Orders]: orderColumnFields,
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
