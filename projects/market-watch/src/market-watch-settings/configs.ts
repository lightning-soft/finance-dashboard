import {
  FieldConfig,
  getCheckboxes,
  getColor,
  getColumnSelector,
  getRadio,
  getSelect,
  noneValue,
  wrapWithConfig
} from 'dynamic-form';
import { MarketWatchColumns } from '../market-watch-columns.enum';
import { OrderColumn } from 'base-order-form';
import { OrderDurationArray, OrderSide, OrderType } from 'trading';

export enum OpenIn {
  orderTicker = 'orderTicket',
  marketWatchRow = 'marketWatchRow',
}

export enum DisplayOrders {
  All = 'all',
  Created = 'created'
}

export const settingsField = [
  new FieldConfig({
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
        label: 'Colors',
        key: 'colors',
        className: 'd-block mt-4 field-item',
        fieldGroupClassName: 'd-grid two-rows field-group',
        fieldGroup: [
          new FieldConfig({
            fieldGroupClassName: 'd-grid two-rows',
            className: 'form-control-no-paddings',
            fieldGroup: [
              getColor('Bid Background'),
              getColor('Ask Background'),
              getColor({ label: 'Bid Qty Color', key: 'bidQuantityColor' }),
              getColor({ label: 'Ask Qty Color', key: 'askQuantityColor' }),
              getColor({ label: 'Bid Text Color', key: 'bidColor' }),
              getColor({ label: 'Ask Text Color', key: 'askColor' }),
              getColor('Price Update Highlight'),
              getColor('Text Color'),
            ]
          }),
          new FieldConfig({
            fieldGroupClassName: 'd-grid two-rows',
            className: 'form-control-no-paddings',
            fieldGroup: [
              getColor('Position Up Color'),
              getColor({ label: 'Net Chg. Down Color', key: 'netChangeDownColor' }),
              getColor('Position Down Color'),
              getColor({ label: 'Net Chg. Up Color', key: 'netChangeUpColor' }),
              getColor('Position Text Color'),
              getColor({ label: '% Chg. Down Color', key: 'percentChangeDownColor' }),
              getColor({ label: '% Chg. Up Color', key: 'percentChangeUpColor' }),
            ]
          }),
        ],
      }),
      new FieldConfig({
        label: 'Display',
        className: 'd-block settings-field field-item',
        fieldGroupClassName: 'field-group',
        fieldGroup: [
          getSelect({
            key: 'highlightType',
            label: 'Price update highlight type',
            className: 'd-block highlightType',
            options: [
              { label: 'None', value: noneValue },
              { label: 'Highlight Text', value: 'Color' },
              { label: 'Highlight Background', value: 'BackgroundColor' },
            ]
          }),
          getCheckboxes({
            checkboxes: [
              {
                label: 'Bold Font',
                key: 'boldFont',
              },
              {
                label: 'Show Tabs',
                key: 'showTabs',
              },
              {
                label: 'Show Orders',
                key: 'showOrders'
              }
            ],
            additionalFields: [
              new FieldConfig({
                label: 'Open New Order in',
                fieldGroup: [],
                className: 'regular-label',
              })
            ],
            extraConfig: {
              fieldGroupClassName: 'd-grid two-rows',
            }
          }),
          new FieldConfig({
            fieldGroupClassName: 'd-grid two-rows',
            fieldGroup: [
              wrapWithConfig(getRadio('displayOrders', [{ label: 'All', value: DisplayOrders.All }, {
                label: 'Created on this window',
                value: DisplayOrders.Created,
              }]), {
                expressionProperties: { 'templateOptions.disabled': (a, b, formField) => {
                    return !formField.model.showOrders;
                  } },
              }),
              wrapWithConfig(getRadio('openIn', [{ label: 'Order Ticket', value: OpenIn.orderTicker }, {
                label: 'MarketWatch row',
                value: OpenIn.marketWatchRow
              }]), {
                expressionProperties: { 'templateOptions.disabled': (a, b, formField) => {
                    return !formField.model.showOrders;
                  } },
              } ),
            ]
          }),
        ],
      }),
      new FieldConfig({
        fieldGroupClassName: '',
        key: 'columnView',
        className: 'd-block settings-field field-item form-control-no-paddings',
        fieldGroup: [
          getColumnSelector({
            key: 'columns',
            label: 'Column view',
            subLabel: '(MarketWatch row / Order row)',
            primaryColumnLabel: 'MarketWatch row',
            className: 'p-0',
            secondaryColumnLabel: 'Orders Row',
            secondaryOptions: [{ label: 'Account', value: OrderColumn.accountId }, {
              label: 'Order ID',
              value: OrderColumn.identifier
            }, 'Side', 'Quantity', 'Type', 'Price', 'Trigger Price', 'Average Fill Price',
              { label: 'TIF', value: OrderColumn.duration }, {
                // label: 'Destination',
                label: 'Description',
                value: OrderColumn.description
              }, 'Status'],
            columns: [
              { label: 'Position', key: MarketWatchColumns.Position }, 'Ask',
              { label: 'Last Price', key: MarketWatchColumns.Last },
              'Ask Quantity', 'Net Change', 'Working Sells',
              { label: '% Change', key: 'percentChange' },
              'Volume', 'Working Buys',
              {
                label: 'Settlement',
                key: MarketWatchColumns.Settle
              },
              'Bid Quantity', 'High', 'Bid', 'Low', 'Open']
          })
        ]
      }),
      new FieldConfig({
          key: 'order',
          label: 'Placing orders by default',
          className: 'order-selects',
          fieldGroup: [
            getSelect({
              label: 'Side', key: 'side', options: [
                { label: OrderSide.Buy, value: OrderSide.Buy },
                { label: OrderSide.Sell, value: OrderSide.Sell },
              ]
            }),
            getSelect({
              label: 'Type', key: 'type', options: [
                { label: OrderType.Limit, value: OrderType.Limit },
                { label: OrderType.Market, value: OrderType.Market },
                { label: OrderType.StopLimit, value: OrderType.StopLimit },
                { label: OrderType.StopMarket, value: OrderType.StopMarket },
              ]
            }),
            getSelect({
              label: 'TIF', key: 'duration',
              options: OrderDurationArray.map(item => ({ label: item, value: item }))
            }),
          ],
        }
      ),
    ],
  })
];
