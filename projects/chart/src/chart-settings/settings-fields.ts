import {
  FieldConfig,
  getCheckboxes,
  getColor,
  getLabel,
  getNumber,
  getSelect,
  getSwitch,
  IFieldConfig,
  wrapWithClass,
} from 'dynamic-form';
import { OrderType } from 'trading';
import { orderFields } from 'base-order-form';

function disableExpression(field, expression: string) {
  return {
    ...field, expressionProperties: {
      'templateOptions.disabled': expression,
    }
  };
}

export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
          fieldGroupClassName: 'd-grid two-rows m-t-20',
          fieldGroup: [
            getColor({ label: 'Up Candle Color', key: 'upCandleColor' }),
            getColor({ label: 'Down Candle Color', key: 'downCandleColor' }),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({ label: 'Up Candle Border Color', key: 'upCandleBorderColor' }),
                  '!model.upCandleBorderColorEnabled'
                ),
                getSwitch('upCandleBorderColorEnabled', ''),
              ]
            }),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({ label: 'Down Candle Border Color', key: 'downCandleBorderColor' }),
                  '!model.downCandleBorderColorEnabled'
                ),
                getSwitch('downCandleBorderColorEnabled', ''),
              ]
            }),
            getColor({ label: 'Line / Bar Color', key: 'lineColor' }),
            getColor({ label: 'Wick Color', key: 'wickColor' }),
          ]
        },
      ),
      new FieldConfig({
          label: ' ',
          fieldGroupClassName: 'd-grid two-rows  p-b-15',
          fieldGroup: [
            getColor({ label: 'Gradient Color 1', key: 'gradient1' }),
            getColor({ label: 'Gradient Color 2', key: 'gradient2' }),
            getColor({ label: 'Value Scale Color', key: 'valueScaleColor' }),
            getColor({ label: 'Date Scale Color', key: 'dateScaleColor' }),
            getColor({ label: 'Grid Color', key: 'gridColor' }),
          ]
        },
      ),
      new FieldConfig({
          label: 'Font',
          key: 'font',
          fieldGroupClassName: 'd-flex p-x-10',
          fieldGroup: [
            getSelect({
              key: 'fontFamily',
              className: 'flex-grow-1 m-r-5',
              options: [
                { label: 'Arial', value: 'Arial' },
                { label: 'Comic Sans', value: 'Comic Sans' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Georgia', value: 'Georgia' },
                { label: 'Impact', value: 'Impact' },
                { label: 'Open Sans', value: 'Open Sans' },
                { label: 'Source Sans Pro', value: 'Source Sans Pro' },
                { label: 'Tangerine', value: 'Tangerine' },
                { label: 'Calibri', value: 'Calibri' },
              ]
            }),
            getSelect({
              key: 'fontSize',
              className: 'd-block',
              options: [
                { label: '8', value: 8 },
                { label: '9', value: 9 },
                { label: '10', value: 10 },
                { label: '11', value: 11 },
                { label: '12', value: 12 },
                { label: '13', value: 13 },
                { label: '14', value: 14 },
                { label: '15', value: 15 },
                { label: '16', value: 16 },
                { label: '17', value: 17 },
                { label: '18', value: 18 },
                { label: '19', value: 19 },
                { label: '20', value: 20 },
              ]
            }),
            {
              ...getColor({ label: 'Text Color', key: 'textColor' }),
              className: 'flex-grow-1 text-color m-l-5'
            },
          ]
        },
      ),
    ],
  }),
];
const orderTypesList = [
  {
    key: OrderType.Limit.toLowerCase(),
    label: 'Limit Orders'
  },
  {
    key: OrderType.Market.toLowerCase(),
    label: 'MT Orders'
  },
  {
    key: 'stop', //OrderType.StopMarket,
    label: 'SM Orders'
  },
  {
    key: 'stopLimit',// OrderType.StopLimit,
    label: 'Stop Limit',
  },
  {
    key: 'oco',
    label: 'OCO'
  }
];

export const tradingFields: IFieldConfig[] = [
  new FieldConfig({
    key: 'trading',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        label: 'Trading',
        className: 'mt-3 d-block',
        fieldGroupClassName: 'd-grid two-rows p-x-7',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'showWorkingOrders', label: 'Show Working Orders' }],
          }),
          {
            fieldGroupClassName: 'd-grid two-rows',
            className: 'd-none',
            fieldGroup: [
              getLabel('PL Unit'),
              getSelect({
                key: 'plUnit',
                options: [
                  { label: 'Points', value: 'points' },
                  { label: 'Currency', value: 'currency' },
                  { label: 'Percent', value: 'percent' },
                  { label: 'Pips', value: 'pips' },
                  { label: 'Ticks', value: 'ticks' },
                  { label: 'None', value: 'none' },
                ],
              })],
          },
          getCheckboxes({
            extraConfig: {className: 'd-none'},
            checkboxes: [{ key: 'chartMarker', label: 'Сhart marker with trades' }],
          }),
          {
            fieldGroupClassName: 'd-grid order-bar-rows',
            fieldGroup: [
              getLabel('Order Bar Length (of chart)'),
              getNumber({
                key: 'tradingBarLength',
                min: 1,
              }),
              getSelect({
                key: 'tradingBarUnit',
                options: [
                  { label: '%', value: 'percent' },
                  { label: 'px', value: 'pixels' },
                ],
              }),
            ],
          },
        ],
      }),
      new FieldConfig({
        label: 'Order Type Colors',
        key: 'ordersColors',
        fieldGroupClassName: 'p-x-7',
        fieldGroup: [
          ...orderTypesList.map(item => getOrderTypeConfig(item.key, item.label)),
        ],
      }),
      {
        key: 'orderArea',
        fieldGroup: [{ ...orderFields, key: 'settings', fieldGroupClassName: 'd-grid two-rows mb-4 p-x-7' }],
      },
    ],
  }),
];

function getOrderTypeConfig(key, label) {
  return {
    fieldGroupClassName: 'd-grid order-rows mt-1',
    key,
    fieldGroup: [
      getLabel(label),
      getSelect({
        key: 'lineType',
        options: [
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' }
        ],
      }),
      wrapWithClass(getColor('lineColor'), 'color-without-label h-20'),
      getNumber({
        key: 'length',
        min: 1,
      }),
      getSelect({
        key: 'lengthUnit',
        options: [{ label: '%', value: 'percents' },
          { label: 'px', value: 'pixels' }],
      }),
    ],
  };
}
