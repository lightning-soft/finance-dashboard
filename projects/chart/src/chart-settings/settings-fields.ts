import {FormlyFieldConfig} from '@ngx-formly/core';
import {
  FieldConfig,
  getCheckboxes,
  getColor,
  getLabel,
  getNumber,
  getRadio,
  getSelect,
  getSessionSelect,
  getSwitch,
  IFieldConfig,
  wrapWithClass,
  wrapWithConfig,
} from 'dynamic-form';
import {OrderDuration, OrderSide, OrderType} from 'trading';

function disableExpression(field, expression: string) {
  return {
    ...field, expressionProperties: {
      'templateOptions.disabled': expression,
    }
  };
}

export const tifSetting = new FieldConfig({
  label: 'TIF',
  key: 'tif',
  className: 'd-block settings-field mb-4',
  fieldGroupClassName: 'p-x-6 d-flex flex-wrap two-rows',
  fieldGroup: [
    getLabel('Default TIF'),
    getSelect({
      key: 'default',
      options: [
        {
          label: 'DAY',
          value: OrderDuration.DAY
        },
        {
          label: 'IOC',
          value: OrderDuration.IOC,
        },
        {
          label: 'FOK',
          value: OrderDuration.FOK,
        },
        {
          label: 'GTC',
          value: OrderDuration.GTC,
        }
      ],
    }),
    getCheckboxes({
      extraConfig: {
        fieldGroupClassName: 'd-grid tif-rows two-rows',
        className: '',
      },
      checkboxes: [
        {
          key: OrderDuration.DAY,
          label: 'Show DAY (Day Order)',
        },
        {
          key: OrderDuration.GTC,
          label: 'Show GTC (Good-Till-Cancel)',
        },
        {
          key: OrderDuration.FOK,
          label: 'Show FOK (Fill-Or-Kill)',
        },
        {
          key: OrderDuration.IOC,
          label: 'Show IOC (Immediate-Or-Cancel)',
        },
      ]
    }),
  ],
});

export const orderAreaSettings = new FieldConfig({
  key: 'orderArea',
  label: 'Order Area',
  className: 'mt-4 d-block',
  fieldGroupClassName: 'p-x-7 d-block',
  fieldGroup: [
    {
      key: 'settings',
      fieldGroupClassName: 'd-block',
      fieldGroup: [
        getOrderAreaItemSettings('Show Liq + Cxl All Button', 'flatten'),
        getOrderAreaItemSettings('Show Liquidate Button', 'showLiquidateButton'),
        getOrderAreaItemSettings('Show Iceberg Button', 'icebergButton'),
        getOrderAreaItemSettings('Show Cancel Buy Market Button', 'buyMarketButton'),
        getOrderAreaItemSettings('Show Cancel Sell Market Button', 'sellMarketButton'),
        getOrderAreaItemSettings('Show Cancel All Button', 'cancelButton'),
      ]
    },
  ],
});

export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
          fieldGroupClassName: 'd-grid two-rows m-t-11',
          fieldGroup: [
            getColor({label: 'Up Candle Color', key: 'upCandleColor'}),
            getColor({label: 'Down Candle Color', key: 'downCandleColor'}),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({label: 'Up Candle Border Color', key: 'upCandleBorderColor'}),
                  '!model.upCandleBorderColorEnabled'
                ),
                getSwitch('upCandleBorderColorEnabled', ''),
              ]
            }),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({label: 'Down Candle Border Color', key: 'downCandleBorderColor'}),
                  '!model.downCandleBorderColorEnabled'
                ),
                getSwitch('downCandleBorderColorEnabled', ''),
              ]
            }),
            getColor({label: 'Line / Bar Color', key: 'lineColor'}),
            getColor({label: 'Wick Color', key: 'wickColor'}),
          ]
        },
      ),
      new FieldConfig({
          className: 'settings-field',
          fieldGroupClassName: 'd-grid two-rows  p-b-15',
          fieldGroup: [
            getColor({label: 'Gradient Color 1', key: 'gradient1'}),
            getColor({label: 'Gradient Color 2', key: 'gradient2'}),
            getColor({label: 'Value Scale Color', key: 'valueScaleColor'}),
            getColor({label: 'Date Scale Color', key: 'dateScaleColor'}),
            getColor({label: 'Grid Color', key: 'gridColor'}),
          ]
        },
      ),
      new FieldConfig({
          label: 'Font',
          key: 'font',
          className: 'settings-field',
          fieldGroupClassName: 'd-grid font-rows',
          fieldGroup: [
            getSelect({
              key: 'fontFamily',
              className: 'flex-grow-1 m-r-4',
              options: [
                {label: 'Arial', value: 'Arial'},
                {label: 'Comic Sans', value: 'Comic Sans'},
                {label: 'Courier New', value: 'Courier New'},
                {label: 'Georgia', value: 'Georgia'},
                {label: 'Impact', value: 'Impact'},
                {label: 'Open Sans', value: 'Open Sans'},
                {label: 'Source Sans Pro', value: 'Source Sans Pro'},
                {label: 'Tangerine', value: 'Tangerine'},
                {label: 'Calibri', value: 'Calibri'},
              ]
            }),
            getSelect({
              key: 'fontSize',
              className: 'd-block m-r-5',
              options: [
                {label: '8', value: 8},
                {label: '9', value: 9},
                {label: '10', value: 10},
                {label: '11', value: 11},
                {label: '12', value: 12},
                {label: '13', value: 13},
                {label: '14', value: 14},
                {label: '15', value: 15},
                {label: '16', value: 16},
                {label: '17', value: 17},
                {label: '18', value: 18},
                {label: '19', value: 19},
                {label: '20', value: 20},
              ]
            }),
            {
              ...getColor({label: 'Text Color', key: 'textColor'}),
              className: 'flex-grow-1 text-color m-l-5'
            },
          ]
        },
      ),
    ],
  }),
];
export const orderTypesList = [
  {
    key: `${OrderSide.Buy.toLowerCase()}.${OrderType.Limit.toLowerCase()}`,
    label: `${OrderSide.Buy} Limit Orders`
  },
  {
    key: `${OrderSide.Buy.toLowerCase()}.${OrderType.Market.toLowerCase()}`,
    label: `${OrderSide.Buy} MT Orders`
  },
  {
    key: `${OrderSide.Buy.toLowerCase()}.stop`, //OrderType.StopMarket,
    label: `${OrderSide.Buy} SM Orders`
  },
  {
    key: `${OrderSide.Buy.toLowerCase()}.stopLimit`,// OrderType.StopLimit,
    label: `${OrderSide.Buy} Stop Limit`,
  },

  {
    key: `${OrderSide.Sell.toLowerCase()}.${OrderType.Limit.toLowerCase()}`,
    label: `${OrderSide.Sell} Limit Orders`
  },
  {
    key: `${OrderSide.Sell.toLowerCase()}.${OrderType.Market.toLowerCase()}`,
    label: `${OrderSide.Sell} MT Orders`
  },
  {
    key: `${OrderSide.Sell.toLowerCase()}.stop`, //OrderType.StopMarket,
    label: `${OrderSide.Sell} SM Orders`
  },
  {
    key: `${OrderSide.Sell.toLowerCase()}.stopLimit`,// OrderType.StopLimit,
    label: `${OrderSide.Sell} Stop Limit`,
  },
];
export const sessionFields: IFieldConfig[] = [
  {
    fieldGroupClassName: 'd-grid session-rows m-t-9',
    key: 'session',
    fieldGroup: [
      getSwitch('sessionEnabled', 'Session Template'),
      wrapWithConfig(getSessionSelect('sessionTemplate', 'Session Template'),
        {
          className: 'd-block session-select', expressionProperties: {
            'templateOptions.disabled': '!model.sessionEnabled',
          }
        })
    ],
  },
];
export const tradingFields: IFieldConfig[] = [
  new FieldConfig({
    key: 'trading',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        label: 'Trading',
        className: 'm-t-8 d-block',
        fieldGroupClassName: 'd-grid two-rows trading-rows p-x-7',
        fieldGroup: [
          getCheckboxes({
            extraConfig: {
              fieldGroupClassName: '',
            },
            checkboxes: [
              {key: 'showWorkingOrders', label: 'Show Working Orders'},
              {key: 'showOrderConfirm', label: 'Require Order Confirmation'},
              {key: 'showCancelConfirm', label: 'Require Cancel Confirmation'}
            ],
          }),
          getCheckboxes({
            extraConfig: {
              fieldGroupClassName: '',
            },
            checkboxes: [
              {key: 'showInstrumentChange', label: 'Show Instrument Change'},
              {key: 'showOHLVInfo', label: 'Show OHLV Info'},
              {key: 'bracketButton', label: 'Bracket Button'},
            ]
          }),
          {
            fieldGroupClassName: 'd-grid align-items-center order-bar-rows',
            fieldGroup: [
              getLabel('Order Bar Length'),
              getNumber({
                key: 'orderBarLength',
                min: 1,
              }),
              getSelect({
                key: 'orderBarUnit',
                options: [
                  {label: '%', value: 'percent'},
                  {label: 'px', value: 'pixels'},
                ],
              }),
            ],
          },
          /*      getCheckboxes({
                  extraConfig: { className: 'pl-info' },
                  checkboxes: [
                    { key: 'showPl', label: 'Show P/L Info' },
                  ],
                  additionalFields: [
                    getSwitch('includeRealized', 'Include Realized P/L'),
                    getSwitch('roundToWhole', 'Round to whole numbers'),
                    getSelect({
                      key: 'plUnit',
                      label: 'PL Unit',
                      className: 'select',
                      options: [
                        { label: 'Points', value: 'points' },
                        { label: 'Currency', value: 'currency' },
                        { label: 'Percent', value: 'percent' },
                        { label: 'Pips', value: 'pips' },
                        { label: 'Ticks', value: 'ticks' },
                        { label: 'None', value: 'none' },
                      ],
                    })
                  ],
                }),*/
          {
            fieldGroup: [
              {
                fieldGroupClassName: 'd-grid align-items-center order-bar-rows',
                fieldGroup: [
                  getLabel('Order Entry Width'),
                  getNumber({
                    key: 'tradingBarLength',
                    min: 1,
                  }),
                  getSelect({
                    key: 'tradingBarUnit',
                    options: [
                      {label: '%', value: 'percent'},
                      {label: 'px', value: 'pixels'},
                    ],
                  }),
                ],
              },

            ],
          },
          /*      getCheckboxes({
                  // extraConfig: {className: 'd-none'},
                  checkboxes: [{ key: 'chartMarker', label: 'Сhart marker with trades' }],
                }),*/
        ],
      }),
      new FieldConfig({
        label: 'Order Type Colors',
        key: 'ordersColors',
        className: 'd-block mt-4',
        fieldGroupClassName: 'p-x-7 d-block',
        fieldGroup: [
          ...orderTypesList.map(item => getOrderTypeConfig(item.key, item.label)),
          {
            fieldGroupClassName: 'd-grid mt-2 oco-rows two-rows',
            fieldGroup: [
              getColor({label: 'OCO Limit Border', key: 'ocoStopLimit'}),
              getColor({label: 'OCO Stop Border', key: 'ocoStopOrder'}),
            ],
          },
        ],
      }),
      orderAreaSettings,
      tifSetting
    ],
  }),
];

function getOrderAreaItemSettings(label, key) {
  return {
    key,
    className: 'd-block mt-1',
    fieldGroupClassName: 'd-grid order-area-rows',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [{
          label,
          key: 'enabled',
        }]
      }),
      getColor('Font'),
      getColor('Background'),
    ],
  };
}

function getOrderTypeConfig(key, label) {
  return {
    fieldGroupClassName: 'd-grid order-rows mt-1',
    key,
    fieldGroup: [
      getLabel(label),
      wrapWithClass(getColor('lineColor'), 'color-without-label h-20'),

      getSelect({
        key: 'lineType',
        options: [
          {label: 'Solid', value: 'solid'},
          {label: 'Dashed', value: 'dashed'},
          {label: 'Dotted', value: 'dotted'}
        ],
      }),
      getNumber({
        key: 'length',
        min: 1,
        max: 10,
      }),
    ],
  };
}

export const valueScale: IFieldConfig[] = [
  new FieldConfig({
    key: 'valueScale',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        label: 'Value Scale',
        className: 'm-t-10 d-block',
        fieldGroupClassName: 'd-grid two-rows p-x-7',
        fieldGroup: [
          {
            fieldGroupClassName: 'd-grid align-items-center order-bar-rows',
            fieldGroup: [
              getRadio('isAutomatic', [{label: 'Automatic', value: 'automatic'}, {
                label: 'Pixel / Price',
                value: 'pixels-price'
              }]),
              getLabel('Pixel Price'),
              wrapWithConfig(
                getNumber({
                  key: 'pixelsPrice',
                  precision: 0,
                  min: 1,
                }),
                {
                  expressionProperties: {
                    'templateOptions.disabled': (model: any, formState: any, field: FormlyFieldConfig) => {
                      return model.isAutomatic === 'automatic';
                    },
                  },
                }
              )
            ],
          }
        ],
      }),
    ],
  }),
];
