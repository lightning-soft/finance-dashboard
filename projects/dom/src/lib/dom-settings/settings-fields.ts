import { FieldType } from 'dynamic-form';
import { FormlyFieldConfig } from '@ngx-formly/core';

function getColor(label: string | any) {
  const _label = typeof label === 'string' ? label : label.label;

  if (!label)
    throw new Error();

  let key = label.key;

  if (!name)
    key = lowerFirstLetter(_label.replace(' ', ''));

  return {
    key,
    name: key,
    type: FieldType.Color,
    templateOptions: {label: _label}
  };
}

function lowerFirstLetter(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function getRadio(key: string, label: string, options: { label: string, value: string }[] | string[]) {
  const _options = (options as Array<any>).map(item => {
    if (typeof item === 'string') {
      return {label: item, value: item};
    }
    return item;
  });
  return {
    key,
    type: FieldType.Radio,
    templateOptions: {label, options: _options}
  };
}

function getCheckboxes(checkboxes: { key: string, label: string }[], label?: string) {
  return {
    wrappers: ['form-field'],
    templateOptions: {
      label
    },
    fieldGroup: [...checkboxes.map(item => {
      return {
        key: item.key,
        type: FieldType.Checkbox,
        templateOptions: {
          label: item.label
        },
      };
    })]
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
    type: FieldType.Select,
    templateOptions: {
      label: 'Font', options: [{label: 'Open Sans', value: 'Open Sans'}],
    },
    key: 'fontFamily'
  },
  {
    type: FieldType.Select,
    templateOptions: {
      label: 'Font',
      options: [
        {label: 'Regular', value: 'regular'}, {label: 'Bold', value: 'bold'}, {label: 'Bolder', value: 'bolder'}]
    },
    key: 'fontWeight'
  },
  {
    type: FieldType.Number,
    templateOptions: {label: 'Font size'},
    key: 'fontSize',
  },
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Columns View'
    },
    fieldGroup: [{
      key: 'notes',
      type: FieldType.Checkbox,
      templateOptions: {
        label: 'Notes'
      },
    },
      {
        key: 'bidDelta',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Bid Delta '
        },
      },
      {
        key: 'totalAtBid',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Total At Bid'
        },
      },
      {
        key: 'askDelta',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Ask Delta'
        }
      },
      {
        key: 'totalAtAsk',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Total At Ask'
        }
      },
      {
        key: 'mergeBidAskDelta',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Merge Bid/Ask Delta'
        }
      },
      {
        key: 'lqt',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Last Traded Quantity (LTQ)'
        }
      },
      {
        key: 'volumeProfile',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Volume Profile'
        }
      },
      {
        key: 'orders',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Orders'
        }
      },
      {
        key: 'currentTradersAtBid',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Current Traders At Bid'
        }
      },
      {
        key: 'bidDepth',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Bid Depth'
        }
      },
      {
        key: 'currentTradersAtAsk',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Current Traders At Ask'
        }
      },
      {
        key: 'askDepth',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Ask Depth'
        }
      },
      {
        key: 'price',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Price'
        }
      },
    ],
  },
];
export const hotkeyFields: FormlyFieldConfig[] = [
  {
    type: FieldType.Input,
    templateOptions: {label: 'Auto Center'},
    key: 'autoCenter',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Auto Center All Windows'},
    key: 'autoCenterWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Buy Market'},
    key: 'buyMarket',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Sell Market'},
    key: 'sellMarket',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Hit Bid'},
    key: 'hitBid',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Join Bid'},
    key: 'joinBid',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Lift Offer'},
    key: 'liftOffer',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'OCO'},
    key: 'oco',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Flatten'},
    key: 'flatten',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Cancel All Orders'},
    key: 'cancelAllOrders',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity 1 Preset'},
    key: 'quantity1',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity 2 Preset'},
    key: 'quantity2',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity 3 Preset'},
    key: 'quantity3',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity 4 Preset'},
    key: 'quantity4',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity 5 Preset'},
    key: 'quantity5',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Quantity to Position Size'},
    key: 'quantityToPos',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Set All Stops to Price'},
    key: 'stopsToPrice',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Alerts'},
    key: 'clearAlerts',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Alerts All Window'},
    key: 'clearAlertsWindow',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear All Totals'},
    key: 'clearTotals',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Current Trades All Windows'},
    key: 'clearCurrentTradesWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Current Trades Down'},
    key: 'clearCurrentTradesDown',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Current Trades Down All Windows'},
    key: 'clearCurrentTradesDownWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Current Trades Up'},
    key: 'clearCurrentTradesUp',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Current Trades Up All Windows'},
    key: 'clearCurrentTradesUpWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Total Trades Down'},
    key: 'clearTotalTradesDown',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Total Trades Down All Windows'},
    key: 'clearTotalTradesDownWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Total Trades Up'},
    key: 'clearTotalTradesUp',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Total Trades Up All Windows'},
    key: 'clearTotalTradesUpWindows',
  },
  {
    type: FieldType.Input,
    templateOptions: {label: 'Clear Volume Profile'},
    key: 'clearVolumeProfile',
  },
];
export const generalFields: FormlyFieldConfig[] = [

  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Reset settings'
    },
    fieldGroup: [{
      key: 'closeOrdersIfClosed',
      type: FieldType.Checkbox,
      name: 'closeOrdersIfClosed',
      templateOptions: {
        label: 'Close Outstanding Orders When Position is Closed'
      },
    },
      {
        key: 'clearCurrentTrades',
        type: FieldType.Checkbox,
        name: 'clearCurrentTrades',
        templateOptions: {
          label: 'Clear Current Trades On New Position'
        },
      },
      {
        key: 'clearTotalTrades',
        type: FieldType.Checkbox,
        name: 'closeOrdersIfClosed',
        templateOptions: {
          label: 'Clear Total Trades On New Position'
        },
      },
      {
        key: 'recenter',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'Re-Center On New Position'
        }
      },
      {
        key: 'allWindows',
        type: FieldType.Checkbox,
        templateOptions: {
          label: 'All Windows'
        }
      }],
  },

  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Account Name'
    },
    fieldGroup: [
      {
        key: 'hideAccountName',
        type: FieldType.Checkbox,
        name: 'hideAccountName',
        templateOptions: {
          label: 'Hide Account Name'
        },
      },
      {
        key: 'hideFromLeft',
        type: FieldType.Checkbox,
        name: 'hideFromLeft',
        templateOptions: {
          label: 'Hide From Left'
        },
      },
      {
        key: 'hideFromRight',
        type: FieldType.Checkbox,
        name: 'hideFromRight',
        templateOptions: {
          label: 'Hide From Right'
        },
      },
    ]
  },

  {
    templateOptions: {label: 'Account Digits To Hide'},
    key: 'digitsToHide',
    type: FieldType.Number,
  },
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Common View'
    },
    fieldGroup: [
      {
        key: 'alwaysOnTop',
        type: FieldType.Checkbox,
        name: 'alwaysOnTop',
        templateOptions: {
          label: 'Always on Top'
        },
      },
      {
        key: 'centerLine',
        type: FieldType.Checkbox,
        name: 'centerLine',
        templateOptions: {
          label: 'Center Line'
        },
      },
      {
        key: 'resetSession',
        type: FieldType.Checkbox,
        name: 'resetSession',
        templateOptions: {
          label: 'Reset on new Session'
        },
      },
      {
        key: 'autoCenter',
        type: FieldType.Checkbox,
        name: 'autoCenter',
        templateOptions: {
          label: 'Auto Center'
        },
      },
      {
        key: 'customTickSize',
        type: FieldType.Checkbox,
        name: 'customTickSize',
        templateOptions: {
          label: 'Use Custom Tick Size'
        },
      },
      {
        templateOptions: {label: 'Auto Center Ticks'},
        key: 'autoCenterTicks',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Ticks per price'},
        key: 'ticksPerPrice',
        type: FieldType.Number,
      },
    ]
  },
  {
    wrappers: ['form-field'],
    templateOptions: {
      label: 'Depth & Market'
    },
    fieldGroup: [
      {
        templateOptions: {label: 'Market Depth'},
        key: 'marketDepth',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Bid/Ask Delta Filter'},
        key: 'bidAskDeltaFilter',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: ' Bid/Ask Delta Depth'},
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
    fieldGroup: [
      {
        templateOptions: {label: 'Clear Traders Timer Interval'},
        key: 'clearTradersTimer',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Update Interval'},
        key: 'updateInterval',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Scroll Wheel Sensitivity'},
        key: 'scrollWheelSensitivity',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Order  Quantity Step'},
        key: 'orderQuantityStep',
        type: FieldType.Number,
      },
      {
        templateOptions: {label: 'Momentum Interval ms'},
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
  getColor('Font Color'),
  getColor('Background Color'),
  getColor('Buy Background Color'),
  getColor('Sell Background Color'),
  getColor('Highlight Color'),
  getCheckboxes([{key: 'accumulateTrades', label: 'Accumulate Trades at Price'}]),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ])
];

export const priceFields: FormlyFieldConfig[] = [
  getColor('Highlight Background Color'),
  getColor('Last Traded Price Font Color'),
  getColor('Non Traded Price Back Color'),
  getColor('Traded Price Back Color'),
  getColor('Price Font Color'),
  getColor('Non Traded Price Font Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ])
];
export const bidDeltaFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
];
export const askDeltaFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
];
export const bidDepthFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getColor('Total Font Color'),
  getCheckboxes([{key: 'bidDepth', label: 'Bid Depth Histogram'}, {
    key: 'highlightLargeBids',
    label: 'Highlight Large Bids Only'
  }]),
  getNumber('bidSize', 'Large Bid Size'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getRadio('orientation', 'Histogram Orientation', [
    'left', 'right'
  ]),
];
export const askDepthFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getColor('Total Font Color'),
  getCheckboxes([{key: 'askDepth', label: 'Ask Depth Histogram'}, {
    key: 'highlightLargeAsks',
    label: 'Highlight Large Asks Only'
  }]),
  getNumber('askSize', 'Large Bid Size'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getRadio('orientation', 'Histogram Orientation', [
    'left', 'right'
  ]),
];
export const totalAskDepthFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getColor('Total Font Color'),
  getCheckboxes([{key: 'totalAsk', label: 'Total At Ask Histogram'}]),
  getNumber('askSize', 'Large Bid Size'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getRadio('orientation', 'Histogram Orientation', [
    'left', 'right'
  ]),
];
export const totalBidDepthFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getColor('Total Font Color'),
  getCheckboxes([{key: 'totalBid', label: 'Total At Bid Histogram'}]),
  getNumber('askSize', 'Large Bid Size'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getRadio('orientation', 'Histogram Orientation', [
    'left', 'right'
  ]),
];
export const volumeFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getColor('Histogram Color'),
  getColor({key: 'controlColor', label: 'Point of Control Color'}),
  getColor({key: 'areaColor', label: 'Value Area Color'}),
  getColor('VWAP Color'),
  getCheckboxes([
    {key: 'volumeProfile', label: 'Volume Profile Histogram'},
    {key: 'ltq', label: 'Last Traded Qty (LTQ)'},
    {key: 'poc', label: 'Point of Control'},
    {label: 'Value Area', key: 'valueArea'},
    {key: 'VWAP', label: 'VWAP'}
  ]),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getRadio('orientation', 'Histogram Orientation', [
    'left', 'right'
  ]),
];
export const orderColumnFields: FormlyFieldConfig[] = [
  getColor('Background Color'),
  getColor('Highlight Color'),
  getColor('Buy Order Background'),
  getColor('Sell Order Background'),
  getColor('Buy Order Foreground'),
  getColor('Sell Order Foreground'),
  getCheckboxes([{key: 'snowPnl', label: 'Show PnL in Column'},
    {key: 'includePnl', label: 'Include Closed PnL'}]),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
  getColor('In Profit Background'),
  getColor('In Profit Foreground'),
  getColor('Loss Background'),
  getColor('Loss Foreground'),
  getColor('Break-even Background'),
  getColor('Break-even Foreground'),
  getCheckboxes([
    {key: 'overlay', label: 'Overlay orders on the Bid/Ask Delta Column'},
    {key: 'split', label: 'Split order column into Buy Orders and Sell Orders'},
  ]),
  getColor('Buy Orders Column'),
  getColor('Sell Orders Column'),
];
export const currentAtBidColumnFields: FormlyFieldConfig[] = [
  getCheckboxes([{key: 'histogram', label: 'Current At Bid Histogram'}]),
  getColor('Level 1'),
  getColor('Level 2'),
  getColor('Level 3'),
  getColor('Level 4'),
  getColor('Level 5'),
  getColor('Level 6'),
  getColor('Level 7'),
  getColor('Level 8'),
  getColor('Tail Inside Bid Fore'),
  getCheckboxes([{key: 'tailBidBold', label: 'Tail Inside Bid Bold'}]),
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Inside Bid Background Color'),
  getColor('Highlight Background Color'),
  getColor('Histogram Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
];
export const currentAtAskFields: FormlyFieldConfig[] = [
  getCheckboxes([{key: 'histogram', label: 'Current At Ask Histogram'}]),
  getColor('Level 1'),
  getColor('Level 2'),
  getColor('Level 3'),
  getColor('Level 4'),
  getColor('Level 5'),
  getColor('Level 6'),
  getColor('Level 7'),
  getColor('Level 8'),
  getColor('Tail Inside Ask Fore'),
  getCheckboxes([{key: 'tailBidBold', label: 'Tail Inside Ask Bold'}]),
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Inside Ask Background Color'),
  getColor('Highlight Background Color'),
  getColor('Histogram Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
];
export const noteColumnFields: FormlyFieldConfig[] = [
  getColor('Ask Volume Color'),
  getColor('Bid Volume Color'),
  getColor('Added Orders Color'),
  getColor('Pulled Orders Color'),
  getColor('Background Color'),
  getColor('Font Color'),
  getColor('Highlight Background Color'),
  getRadio('align', 'Text Align', [
    'left', 'center', 'right'
  ]),
];
