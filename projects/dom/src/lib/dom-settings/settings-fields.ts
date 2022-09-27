import {
  FieldConfig,
  FieldType,
  getCheckboxes,
  getColor,
  getHistogramColor,
  getHistogramOrientation,
  getHotkey, getLabel,
  getNumber, getSelect,
  getSessionSelect, getSwitch,
  getTextAlign,
  IFieldConfig,
  wrapWithClass
} from 'dynamic-form';
import { wrapWithConfig } from 'projects/dynamic-form';
import {tradingFields} from 'chart';
import * as clone from 'lodash.clonedeep';



function getHightlightColor() {
  return getColor('Highlight Background Color');
}

function getBackgroundColor() {
  return getColor('Background Color');
}

function getFontColor() {
  return getColor({ key: 'color', label: 'Font Color' });
}

export const commonFields: IFieldConfig[] = [
  new FieldConfig({
    label: 'Font',
    key: 'common',
    fieldGroup: [
      {
        type: FieldType.Select,
        templateOptions: {
          options: [{ label: 'Open Sans', value: '\"Open Sans\", sans-serif' },
            { label: 'Monospace', value: 'monospace' },
            { label: 'Sans Serif', value: 'sans-serif' }],
        },
        className: 'p-l-7',
        key: 'fontFamily',
      },
      {
        type: FieldType.Select,
        templateOptions: {
          options: [
            { label: 'Regular', value: '' }, { label: 'Bold', value: '700' }]
        },
        className: 'p-r-7',
        key: 'fontWeight',
        getCss: (value) => {
          if (value && value.fontWeight)
            return { ' table tbody td .data': { 'font-weight': value.fontWeight } };
        }
      },
      {
        type: FieldType.Number,
        templateOptions: { label: 'Font size', min: 1 },
        className: 'p-l-7',
        key: 'fontSize',
      },
      new FieldConfig({
        label: 'General Color',
        key: 'generalColors',
        fieldGroupClassName: 'd-flex two-rows flex-wrap p-x-7',
        className: 'w-100 ml-0 field-item',
        fieldGroup: [
          getColor('Grid Line Color'),
          getColor('Order Grid Line Color'),
          getColor('Center Line Color'),
          getCheckboxes(
            {
              checkboxes: [{
                label: 'Enable Order Grid Color',
                config: { className: 'w-100 mt-0' },
                key: 'enableOrderGridColor'
              }]
            })
          // getColor('Simulation Mode Warning Clr'),
        ]
      }),
      {
        ...getCheckboxes(
          {
            checkboxes: [
              // { key: 'notes', label: 'Notes' },
              { label: 'Bid Delta', key: 'bidDelta' },
              { label: 'Total At Bid', key: 'totalBid' },
              { label: 'Ask Delta', key: 'askDelta' },
              { label: 'Total At Ask', key: 'totalAsk' },
              { label: 'Merge Bid/Ask Delta', key: 'delta' },
              { label: 'Last Traded Quantity(LQT)', key: 'ltq' },
              { label: 'Volume Profile', key: 'volume' },
              { label: 'Orders', key: 'orders', config: { className: 'ordersCheckbox' } },
              { label: 'Buy Orders', key: 'buyOrders', config: { className: 'splitOrdersCheckbox' } },
              { label: 'Sell Orders', key: 'sellOrders', config: { className: 'splitOrdersCheckbox' } },
              // { label: 'Current Trades At Bit', key: 'currentTradesAtBit' },
              { label: 'Bid Depth', key: 'bid' },
              // { label: 'Current Trades At Ask', key: 'currentTradesAtAsk' },
              { label: 'Ask Depth', key: 'ask' },
              { label: 'Price', key: 'price' },
              { label: 'Сurrent Ask', key: 'currentAsk' },
              { label: 'Сurrent Bid', key: 'currentBid' },
            ],
            label: 'Columns View',
            extraConfig: { className: 'w-100', fieldGroupClassName: 'd-grid mt-2 grid-two-rows p-x-7' }
          }), className: 'w-100  field-item'
      }
    ]
  }),
];
export const hotkeyFields: IFieldConfig[] = [
  new FieldConfig(
    {
      label: '',
      key: 'hotkeys',
      fieldGroupClassName: 'w-100  hotkey-list',
      fieldGroup: [
        wrapWithClass(getHotkey('Auto Center'), 'd-block'),
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
          {
            key: 'closeOutstandingOrders',
            label: 'Close Outstanding Orders When Position is Closed', config: {
              className: 'close-current-orders',
            }
          },
          { key: 'clearCurrentTrades', label: 'Clear Current Trades On New Position' },
          {
            label: 'All Windows', key: 'currentTradesAllWindows', config: {
              expressionProperties: {
                'templateOptions.disabled': '!model.clearCurrentTrades',
              }
            }
          },
          // disableExpression({ label: 'All Windows',  key: 'currentTradesAllWindows' }, '!model.clearCurrentTrades'),
          { label: 'Clear Total Trades On New Position', key: 'clearTotalTrades' },
          {
            label: 'All Windows', key: 'currentTotalAllWindows', config: {
              expressionProperties: {
                'templateOptions.disabled': '!model.clearTotalTrades',
              }
            }
          },
          { label: 'Re-Center On New Position', key: 'recenter' },
          {
            label: 'All Windows', key: 'recenterTotalAllWindows', config: {
              expressionProperties: {
                'templateOptions.disabled': '!model.recenter',
              }
            }
          },
        ],
        extraConfig: {
          fieldGroupClassName: 'd-grid reset-settings',
        },
        label: 'Reset settings'
      }),
      new FieldConfig({
        label: 'Common View',
        fieldGroupClassName: 'd-flex flex-wrap two-rows-mt-0 p-x-7',
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
              {
                label: 'Use Custom Tick Size',
                key: 'useCustomTickSize',
              }
            ], extraConfig: { className: 'w-100', fieldGroupClassName: 'd-flex flex-wrap two-rows-mt-0 ', }

          }),
          {
            templateOptions: { label: 'Auto Center Ticks', min: 1, },
            key: 'autoCenterTicks',
            className: 'ml-0 mr-0',
            type: FieldType.Number,
          },
          {
            templateOptions: {
              min: 1,
              step: 1,
              label: 'Levels per ticks'
            },
            // expressionProperties: {
            // 'templateOptions.disabled': '!model.useCustomTickSize',
            // },
            key: 'ticksMultiplier',
            type: FieldType.Number,
          },

        ]
      }),

      new FieldConfig({
        label: 'Depth & Market',
        key: 'marketDepth',
        fieldGroupClassName: 'd-flex two-rows-mt-0 flex-wrap  p-x-7',
        fieldGroup: [
          {
            templateOptions: { label: 'Market Depth', min: 1, },
            key: 'marketDepth',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: 'Bid/Ask Delta Filter', min: 0 },
            key: 'bidAskDeltaFilter',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: ' Bid/Ask Delta Depth', min: 1 },
            key: 'bidAskDeltaDepth',
            type: FieldType.Number,
          },
          // {
          //   key: 'showDepthHistory',
          //   type: FieldType.Checkbox,
          //   name: 'alwaysOnTop',
          //   templateOptions: {
          //     label: 'Show Depth History'
          //   },
          // },
        ]
      }),
      new FieldConfig({
        label: 'Intervals',
        fieldGroupClassName: 'd-flex two-rows-mt-0 flex-wrap  p-x-7',
        fieldGroup: [
          {
            templateOptions: { label: 'Clear Trades Timer Interval', min: 1 },
            key: 'clearTradersTimer',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: 'Update Interval', min: 1 },
            key: 'updateInterval',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: 'Scroll Wheel Sensitivity', min: 1 },
            key: 'scrollWheelSensitivity',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: 'Order  Quantity Step', min: 1 },
            key: 'orderQuantityStep',
            type: FieldType.Number,
          },
          {
            templateOptions: { label: 'Momentum Interval ms', min: 1 },
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
    fieldGroupClassName: 'd-flex flex-wrap p-x-4 w-100',
    fieldGroup: [
      new FieldConfig({
          fieldGroup: [
            getFontColor(),
            getColor('Sell Background Color'),
            getColor('Background Color'),
            getColor({ label: 'Highlight Background Color', key: 'highlightBackgroundColor' }),
            //  getHistogramColor(),
            getColor('Buy Background Color'),
          ]
        },
      ),
      {
        fieldGroupClassName: 'd-flex flex-wrap align-items-end two-rows w-100 p-x-4',
        className: 'd-block w-100',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              key: 'accumulateTrades',
              label: 'Accumulate Trades at Price',
              config: { className: 'w-100' }
            }]
          }),
          wrapWithClass(getTextAlign(), 'd-flex align-items-center'),
        ]
      }],
  }),
];

const tradingGeneral =   new FieldConfig({
    label: 'Trading',
  className: 'w-100 order-form-settings',
  fieldGroupClassName: 'd-block ml-2',
  fieldGroup: [
    getCheckboxes({
      checkboxes: [
        { key: 'showOrderConfirm', label: 'Require Order Confirmation' },
        { key: 'showCancelConfirm', label: 'Require Cancel Confirmation' },
        { key: 'overlayOrders', label: 'Overlay orders on the Bid/Ask Delta Column' },
        { key: 'split', label: 'Split order column into Buy Orders and Sell Orders' },
      ],
      extraConfig: { fieldGroupClassName: 'd-block' }
    })]
  });
const tradingOrderDom =   new FieldConfig({
  className: 'w-100 order-form-settings mb-3',
  fieldGroupClassName: 'd-block',
  fieldGroup: [
    getCheckboxes({
      checkboxes: [
        { key: 'showInstrumentChange', label: 'Show Instrument Change' },
        { key: 'showOHLVInfo', label: 'Show OHLV Info' },
        { key: 'showBracket', label: 'Show Bracket Button' },
        { key: 'showPLInfo', label: 'Show PL Info' },
        { key: 'roundPL', label: 'Round PL to whole numbers' },
      ],
      extraConfig: { fieldGroupClassName: 'd-block' }
    }),
    getSwitch('includeRealizedPL', 'Include Realized tradingDomFields',
      { hideExpression: '!model.showPLInfo' }
    )
  ],
  });
const tradingGeneral2 =       new FieldConfig({
    fieldGroupClassName: 'd-flex flex-wrap d-flex-just two-rows-dom p-x-7 mt-2',
    className: 'mt-0',
    fieldGroup: [
      disableExpression(getColor({ label: 'Buy Orders Column', key: 'buyOrdersBackgroundColor' }), '!model.split'),
      disableExpression(getColor({
        label: 'Sell Orders Column',
        key: 'sellOrdersBackgroundColor'
      }), '!model.split')]
  });

const tradingDomFields = clone(tradingFields);
tradingDomFields[0].className = 'field-item dom-trading';
tradingDomFields[0].fieldGroup.shift();
tradingDomFields[0].fieldGroup.unshift(tradingGeneral2);
tradingDomFields[0].fieldGroup.unshift(tradingGeneral);
tradingDomFields[0].fieldGroup[3].fieldGroup.unshift(tradingOrderDom);

export const priceFields: IFieldConfig[] = [
  new FieldConfig({
    fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
    label: 'Price',
    fieldGroup: [
      getColor({ label: 'Highlight Background Color', key: 'highlightBackgroundColor' }),
      getColor({ label: 'Last Traded Price Font Color', key: 'highlightColor' }),
      getColor({ label: 'Non Traded Price Back Color', key: 'backgroundColor' }),
      getColor({ label: 'Non Traded Price Font Color', key: 'color' }),
      getColor({ label: 'Traded Price Back Color', key: 'tradedPriceBackgroundColor' }),
      getColor({ label: 'Traded Price Font Color', key: 'tradedPriceColor' }),
      getTextAlign()
    ]
  }),
];

function getDeltaFields(label: string) {
  return [
    new FieldConfig({
      fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
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
    label: `${ label } Depth`,
    key: label.toLowerCase(),
    fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
    fieldGroup: [
      getColor('Background Color'),
      getFontColor(),
      getHistogramColor('Highlight Color'),
      getColor({ label: 'Total Font Color', key: 'totalColor' }),
      {
        ...getCheckboxes({
          checkboxes: [
            { key: 'histogramEnabled', label: `${ label } Depth Histogram` },
            { key: 'highlightLarge', label: `Highlight Large ${ label } Only` }]
        }),
        className: 'w-100 mr-0',
      },
      /*  getNumber({ key: 'font-size', label: 'Large Ask Size' }),
        getTextAlign(),*/
      getHistogramOrientation(),
      getNumber({ key: 'largeSize', label: `Large ${ label } Size`, min: 1 }),
      {},
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
      fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
      fieldGroup: [
        getBackgroundColor(),
        getHightlightColor(),
        getFontColor(),
        getHistogramColor(),
        getCheckboxes({
          checkboxes: [{ key: 'histogramEnabled', label: `${ label } Histogram` }], extraConfig: {
            className: ' depth-checkboxes',
            fieldGroupClassName: 'd-flex checkbox-field-group flex-wrap',
          }
        }),
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
    fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
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
      new FieldConfig({
        key: 'sessions',
        label: null,
        fieldGroupClassName: '',
        className: 'mx-0 w-100 sessions',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              key: 'histogramEnabled', label: 'Overlay ETH on RTH',
            }],
            additionalFields: [
              getColor('Overlay Line Color'),
            ],
          }),
          wrapWithClass(getSessionSelect('rth', 'RTH Session Template'), 'mt-1 d-block'),
          wrapWithClass(getSessionSelect('eth', 'ETH Session Template'), 'mt-1 d-block'),
        ],
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
    label: 'Orders',
    key: 'orders',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-4',
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
        fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-4',
        fieldGroup: [
          {
            ...getCheckboxes({
              checkboxes: [{ key: 'showPL', label: 'Show PL in Column' },
                { key: 'includeRealizedPL', label: 'Include Realized PL' }]
            }),
            fieldGroupClassName: '',
            className: 'pl-0',
          },
          getTextAlign(),
        ]
      }),
      new FieldConfig({
        className: 'mb-0',
        fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
        fieldGroup: [
          getColor({ label: 'In Profit Background', key: 'inProfitBackgroundColor' }),
          getColor({ label: 'In Profit Foreground', key: 'inProfitColor' }),
          getColor({ label: 'Loss Background', key: 'lossBackgroundColor' }),
          getColor({ label: 'Loss Foreground', key: 'lossColor' }),
          // getColor({ label: 'Break-even Background', key: 'break-evenBackgroundColor' }),
          // getColor({ label: 'Break-even Foreground', key: 'break-evenForegroundColor' }),
          {
            ...getCheckboxes({
              checkboxes: [
                { key: 'overlayOrders', label: 'Overlay orders on the Bid/Ask Delta Column' },
                { key: 'split', label: 'Split order column into Buy Orders and Sell Orders' },
              ]
            }),
            fieldGroupClassName: '', className: 'w-100 m-0 pl-0'
          },

        ]
      }),
      new FieldConfig({
        fieldGroupClassName: 'd-flex flex-wrap  two-rows p-x-7',
        className: 'mt-0',
        fieldGroup: [
          disableExpression(getColor({ label: 'Buy Orders Column', key: 'buyOrdersBackgroundColor' }), '!model.split'),
          disableExpression(getColor({
            label: 'Sell Orders Column',
            key: 'sellOrdersBackgroundColor'
          }), '!model.split')]
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
      label: `Current At ${ suffix }`,
      key: `current${ suffix }`,
      fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
      fieldGroup: [
        getCheckboxes({
          checkboxes: [{
            key: 'histogramEnabled',
            config: {
              className: 'w-100 mb-1',
            },
            label: `Current At ${ suffix } Histogram`
          }]
        }),
        wrapWithClass(getBackgroundColor(), 'current-background'),
        wrapWithConfig(new FieldConfig({
          label: 'Tails Background Colors',
          className: 'color-levels mt-2 d-block',
          fieldGroupClassName: 'current-level',
          fieldGroup: [1, 2, 3, 4, 5, 6, 7, 8]
            .map(i => getColor({ label: `Level ${ i }`, key: `level${ i }BackgroundColor` })),
        }), { key: null }),
        new FieldConfig({
          fieldGroupClassName: 'current-level',
          className: 'current-level-item',
          fieldGroup: [
            getFontColor(),
            getColor({ label: `Inside ${ suffix } Background Color`, key: 'insideBackgroundColor' }),
            getHightlightColor(),
            getHistogramColor(),
            getTextAlign(),
          ]
        }),
        new FieldConfig({
          fieldGroupClassName: 'w-100',
          className: 'm-t-16',
          fieldGroup: [
            getColor({ label: `Tail Inside ${ suffix } Fore`, key: 'tailInsideColor' }),
            getCheckboxes({
              checkboxes: [{
                key: `tailInsideBold`,
                label: `Tail Inside ${ suffix } Bold`,
                className: 'w-100'
              }]
            }),
          ]
        }),
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
  Trading = 'trading',
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
  [SettingTab.Trading]: tradingDomFields,
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
