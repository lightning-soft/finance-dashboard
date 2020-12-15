import { FieldConfig, FieldType, InputType } from "../../../../dynamic-form";

export  const commonFields: FieldConfig[] = [
  {
    type: FieldType.Select,
    label: 'Font',
    options: ['Open Sans'],
    value: 'Open Sans',
    name: 'fontFamily'
  },
  {
    type: FieldType.Select,
    label: 'Font',
    options: ['Regular', 'Bold', 'Bolder'],
    value: 'Regular',
    name: 'fontWeight'
  },
  {
    type: FieldType.Input,
    label: 'Font size',
    value: 12,
    name: 'fontSize',
    inputType: InputType.Number,
  },
  {
    type: FieldType.Checkbox,
    label: 'Columns View',
    name: 'view',
    value: ['Alert', 'Volume Profile'],
    options: ['Alert', 'Ask Delta', 'Bid Profile', 'Bid Delta', 'Ask Profile', 'Volume Profile',
      'Merge Bid/Ask Delta', 'Current Traders at Bid', 'Last Traded Quantity (LTO)', 'Current Traders at Ask', 'Orders']
  }
];
export  const hotkeyFields: FieldConfig[] = [
  {
    type: FieldType.Input,
    label: 'Auto Center',
    inputType: InputType.Text,
    name: 'autoCenter',
  },
  {
    type: FieldType.Input,
    label: 'Auto Center All Windows',
    inputType: InputType.Text,
    name: 'autoCenterWindows',
  },
  {
    type: FieldType.Input,
    label: 'Buy Market',
    inputType: InputType.Text,
    name: 'buyMarket',
  },
  {
    type: FieldType.Input,
    label: 'Sell Market',
    inputType: InputType.Text,
    name: 'sellMarket',
  },
  {
    type: FieldType.Input,
    label: 'Hit Bid',
    inputType: InputType.Text,
    name: 'hitBid',
  },
  {
    type: FieldType.Input,
    label: 'Join Bid',
    inputType: InputType.Text,
    name: 'joinBid',
  },
  {
    type: FieldType.Input,
    label: 'Lift Offer',
    inputType: InputType.Text,
    name: 'liftOffer',
  },
  {
    type: FieldType.Input,
    label: 'OCO',
    inputType: InputType.Text,
    name: 'oco',
  },
  {
    type: FieldType.Input,
    label: 'Flatten',
    inputType: InputType.Text,
    name: 'flatten',
  },
  {
    type: FieldType.Input,
    label: 'Cancel All Orders',
    inputType: InputType.Text,
    name: 'cancelAllOrders',
  },
  {
    type: FieldType.Input,
    label: 'Quantity 1 Preset',
    inputType: InputType.Text,
    name: 'quantity1',
  },
  {
    type: FieldType.Input,
    label: 'Quantity 2 Preset',
    inputType: InputType.Text,
    name: 'quantity2',
  },
  {
    type: FieldType.Input,
    label: 'Quantity 3 Preset',
    inputType: InputType.Text,
    name: 'quantity3',
  },
  {
    type: FieldType.Input,
    label: 'Quantity 4 Preset',
    inputType: InputType.Text,
    name: 'quantity4',
  },
  {
    type: FieldType.Input,
    label: 'Quantity 5 Preset',
    inputType: InputType.Text,
    name: 'quantity5',
  },
  {
    type: FieldType.Input,
    label: 'Quantity to Position Size',
    inputType: InputType.Text,
    name: 'quantityToPos',
  },
  {
    type: FieldType.Input,
    label: 'Set All Stops to Price',
    inputType: InputType.Text,
    name: 'stopsToPrice',
  },
  {
    type: FieldType.Input,
    label: 'Clear Alerts',
    inputType: InputType.Text,
    name: 'clearAlerts',
  },
  {
    type: FieldType.Input,
    label: 'Clear Alerts All Window',
    inputType: InputType.Text,
    name: 'clearAlertsWindow',
  },
  {
    type: FieldType.Input,
    label: 'Clear All Totals',
    inputType: InputType.Text,
    name: 'clearTotals',
  },
  {
    type: FieldType.Input,
    label: 'Clear Current Trades All Windows',
    inputType: InputType.Text,
    name: 'clearCurrentTradesWindows',
  },
  {
    type: FieldType.Input,
    label: 'Clear Current Trades Down',
    inputType: InputType.Text,
    name: 'clearCurrentTradesDown',
  },
  {
    type: FieldType.Input,
    label: 'Clear Current Trades Down All Windows',
    inputType: InputType.Text,
    name: 'clearCurrentTradesDownWindows',
  },
  {
    type: FieldType.Input,
    label: 'Clear Current Trades Up',
    inputType: InputType.Text,
    name: 'clearCurrentTradesUp',
  },
  {
    type: FieldType.Input,
    label: 'Clear Current Trades Up All Windows',
    inputType: InputType.Text,
    name: 'clearCurrentTradesUpWindows',
  },
  {
    type: FieldType.Input,
    label: 'Clear Total Trades Down',
    inputType: InputType.Text,
    name: 'clearTotalTradesDown',
  },
  {
    type: FieldType.Input,
    label: 'Clear Total Trades Down All Windows',
    inputType: InputType.Text,
    name: 'clearTotalTradesDownWindows',
  },
  {
    type: FieldType.Input,
    label: 'Clear Total Trades Up',
    inputType: InputType.Text,
    name: 'clearTotalTradesUp',
  },
  {
    type: FieldType.Input,
    label: 'Clear Total Trades Up All Windows',
    inputType: InputType.Text,
    name: 'clearTotalTradesUpWindows',
  },
  {
    type: FieldType.Input,
    label: 'Clear Volume Profile',
    inputType: InputType.Text,
    name: 'clearVolumeProfile',
  },
];
export  const generalFields: FieldConfig[] = [
  {
    label: 'Reset settings',
    name: 'resetSettings',
    type: FieldType.Checkbox,
    options: ['Close Outstanding Orders When Positin is Closed', 'Clear Current Trades On New Position',
      'Clear Total Trades On New Position', 'Re-Center On New Position', 'All Windows']
  },
  {
    label: 'Account Name',
    type: FieldType.Checkbox,
    name: 'accountName',
    options: ['Hide Account Name', 'Hide From Left', 'Hide From Right,']
  },
  {
    label: 'Account Digits To Hide',
    name: 'digitsToHide',
    type: FieldType.Input,
    value: 2,
    inputType: InputType.Number
  },
  {
    type: FieldType.Checkbox,
    label: 'Common View',
    name: 'commonView',
    options: ['Always On Top', 'Reset on New Session', 'Center Line', 'Auto Center']
  },
  {
    label: 'Auto Center Ticks',
    name: 'autoCenterTicks',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 24,
  },
  {
    label: 'Market Depth',
    name: 'marketDepth',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 100,
  },
  {
    label: 'Bid/Ask Delta Filter',
    name: 'deltaFilter',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 1,
  },
  {
    label: 'Bid/Ask Delta Depth',
    name: 'deltaDepth',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 1,
  },
  {
    type: FieldType.Checkbox,
    label: 'History',
    name: 'depthHistory',
    options: ['Show Depth History']
  },
  {
    label: 'Clear Traders Timer Interval',
    name: 'clearTimer',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 9999,
  },
  {
    label: 'Update Interval',
    name: 'updateInterval',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 100,
  },
  {
    label: 'Update Interval Prints',
    name: 'updateIntervalPrints',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 100,
  },
  {
    label: 'Scroll Wheel Sensitivity',
    name: 'scrollWheel',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 1,
  },
  {
    label: 'Order  Quantity Step',
    name: 'quantityStep',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 1,
  },
  {
    label: 'Momentum Interval ms',
    name: 'interval',
    type: FieldType.Input,
    inputType: InputType.Number,
    value: 500,
  },
  {
    name: 'other',
    type: FieldType.Checkbox,
    options: ['Print Outlines', 'Momentum Tails']
  }
];
export  const ltqFields: FieldConfig[] = [
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'buyBackgroundColor',
    type: FieldType.Color,
    label: 'Buy Background Color'
  },
  {
    name: 'sellBackgroundColor',
    type: FieldType.Color,
    label: 'Sell Background Color'
  },
  {
    name: 'highlightColor',
    type: FieldType.Color,
    label: 'Highlight Color'
  },
  {
    name: 'accumulateTrades',
    type: FieldType.Checkbox,
    options: ['Accumulate Trades at Price']
  },
];
export  const priceFields: FieldConfig[] = [
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'lastTradedColor',
    type: FieldType.Color,
    label: 'Last Traded Price Font Color'
  },
  {
    name: 'nonTradedColor',
    type: FieldType.Color,
    label: 'Non Traded Price Back Color'
  },
  {
    name: 'tradedPriceColor',
    type: FieldType.Color,
    label: 'Traded Price Back Color'
  },
  {
    name: 'priceFontColor',
    type: FieldType.Color,
    label: 'Price Font Color'
  },
  {
    name: 'nonTradedPriceFontColor',
    type: FieldType.Color,
    label: 'Non Traded Price Font Color'
  },
];
export  const bidDeltaFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'

  }
];
export  const askDeltaFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'

  }
];
export  const bidDepthFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'totalFontColor',
    type: FieldType.Color,
    label: 'Total Font Color'
  },
  {
    name: 'bids',
    type: FieldType.Checkbox,
    options: ['Bid Depth Histogram', 'Highlight Large Bids Only']
  },
  {
    name: 'bidSize',
    type: FieldType.Input,
    inputType: InputType.Number,
    label: 'Large Bid Size'
  },
  {
    name: 'orientation',
    type: FieldType.Radio,
    label: 'Histogram Orientation',
    options: ['Left', 'Right']
  }
];
export  const askDepthFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'totalFontColor',
    type: FieldType.Color,
    label: 'Total Font Color'
  },
  {
    name: 'bids',
    type: FieldType.Checkbox,
    options: ['Ask Depth Histogram', 'Highlight Large Asks Only']
  },
  {
    name: 'bidSize',
    type: FieldType.Input,
    inputType: InputType.Number,
    label: 'Large Ask Size'
  },
  {
    name: 'orientation',
    type: FieldType.Radio,
    label: 'Histogram Orientation',
    options: ['Left', 'Right']
  }
];
export  const totalAskDepthFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'totalFontColor',
    type: FieldType.Color,
    label: 'Total Font Color'
  },
  {
    name: 'bids',
    type: FieldType.Checkbox,
    options: ['Total At Ask Histogram']
  },
  {
    name: 'orientation',
    type: FieldType.Radio,
    label: 'Histogram Orientation',
    options: ['Left', 'Right']
  }
];
export  const totalBidDepthFields: FieldConfig[] = [{
  name: 'backgroundColor',
  type: FieldType.Color,
  label: 'Background Color'
},
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'totalFontColor',
    type: FieldType.Color,
    label: 'Total Font Color'
  },
  {
    name: 'bids',
    type: FieldType.Checkbox,
    options: ['Total At Bid Histogram']
  },
  {
    name: 'orientation',
    type: FieldType.Radio,
    label: 'Histogram Orientation',
    options: ['Left', 'Right']
  }
];
export  const volumeFields: FieldConfig[] = [{
  name: 'backgroundColor',
  type: FieldType.Color,
  label: 'Background Color'
},
  {
    name: 'fontColor',
    type: FieldType.Color,
    label: 'Font Color'
  },
  {
    name: 'highlightBackgroundColor',
    type: FieldType.Color,
    label: 'Highlight Background Color'
  },
  {
    name: 'histogramColor',
    type: FieldType.Color,
    label: 'Histogram Color'
  },
  {
    name: 'controlColor',
    type: FieldType.Color,
    label: 'Point of Control Color'
  },
  {
    name: 'areaColor',
    type: FieldType.Color,
    label: 'Value Area Color'
  },
  {
    name: 'vmapColor',
    type: FieldType.Color,
    label: 'VWAP Color'
  },
  {
    name: 'volume',
    type: FieldType.Checkbox,
    options: ['Volume Profile Histogram', 'Last Traded Qty (LTQ)', 'Point of Control', 'Value Area', 'VWAP']
  },
  {
    name: 'textAlign',
    type: FieldType.Radio,
    label: 'Text Align',
    options: ['Left', 'Center', 'Right']
  },
  {
    name: 'orientation',
    type: FieldType.Radio,
    label: 'Histogram Orientation',
    options: ['Left', 'Right']
  }
];
export  const orderColumnFields: FieldConfig[] = [
  {
    name: 'backgroundColor',
    type: FieldType.Color,
    label: 'Background Color'
  },
  {
    name: 'highlightColor',
    type: FieldType.Color,
    label: 'Highlight Color'
  },
  {
    name: 'buyOrderBackground',
    type: FieldType.Color,
    label: 'Buy Order Background'
  },
  {
    name: 'sellOrderBackground',
    type: FieldType.Color,
    label: 'Sell Order Background'
  },
  {
    name: 'buyOrderForeground',
    type: FieldType.Color,
    label: 'Buy Order Foreground'
  },
  {
    name: 'sellOrderForeground',
    type: FieldType.Color,
    label: 'Sell Order Foreground'
  },
  {
    name: 'pnl',
    type: FieldType.Checkbox,
    options: ['Show PnL in Column', 'Include Closed PnL']
  },
  {
    name: 'textAlign',
    type: FieldType.Radio,
    label: 'Text Align',
    options: ['Left', 'Center', 'Right']
  },
  {
    type: FieldType.Color,
    name: 'inProfitBackground',
    label: 'In Profit Background'
  },
  {
    type: FieldType.Color,
    name: 'inProfitForeground',
    label: 'In Profit Foreground'
  },
  {
    type: FieldType.Color,
    name: 'lossBackground',
    label: 'Loss Background'
  },
  {
    type: FieldType.Color,
    name: 'lossForeground',
    label: 'Loss Foreground'
  },
  {
    type: FieldType.Color,
    name: 'breakEvenBackground',
    label: 'Break-even Background'
  },
  {
    type: FieldType.Color,
    name: 'breakEvenForeground',
    label: 'Break-even Foreground'
  },
  {
    type: FieldType.Checkbox,
    name: 'orders',
    options: ['Overlay orders on the Bid/Ask Delta Column', 'Split order column into Buy Orders and Sell Orders', 'Buy Orders Column'],
  },
  {
    type: FieldType.Color,
    name: 'sellOrdersColumn',
    label: 'Sell Orders Column'
  },
];
export  const currentAtBidColumnFields: FieldConfig[] = [
  {type: FieldType.Checkbox, name: 'histogram', options: ['Current At Bid Histogram']},
  {type: FieldType.Color, name: 'level1', label: 'Level 1'},
  {type: FieldType.Color, name: 'level2', label: 'Level 2'},
  {type: FieldType.Color, name: 'level3', label: 'Level 3'},
  {type: FieldType.Color, name: 'level4', label: 'Level 4'},
  {type: FieldType.Color, name: 'level5', label: 'Level 5'},
  {type: FieldType.Color, name: 'level6', label: 'Level 6'},
  {type: FieldType.Color, name: 'level7', label: 'Level 7'},
  {type: FieldType.Color, name: 'level8', label: 'Level 8'},
  {type: FieldType.Color, name: 'tailBidFore', label: 'Tail Inside Bid Fore'},
  {type: FieldType.Color, name: 'tailBidBold', label: 'Tail Inside Bid Bold'},
  {type: FieldType.Color, name: 'backgroundColor', label: 'Background Color'},
  {type: FieldType.Color, name: 'fontColor', label: 'Font Color'},
  {type: FieldType.Color, name: 'insideBackgroundColor', label: 'Inside Bid Background Color'},
  {type: FieldType.Color, name: 'highlightBackgroundColor', label: 'Highlight Background Color'},
  {type: FieldType.Color, name: 'highlightBackgroundColor', label: 'Histogram Color'},
  {type: FieldType.Checkbox, name: 'tail', options: ['Tail Inside Bid Fore', 'Tail Inside Bid Bold']},
  {
    name: 'textAlign',
    type: FieldType.Radio,
    label: 'Text Align',
    options: ['Left', 'Center', 'Right']
  },
];
export  const noteColumnFields: FieldConfig[] = [
  {type: FieldType.Color, name: 'backgroundColor', label: 'Background Color'},
  {type: FieldType.Color, name: 'fontColor', label: 'Font Color'},
  {type: FieldType.Color, name: 'highlightBackgroundColor', label: 'Highlight Background Color'},
  {
    name: 'textAlign',
    type: FieldType.Radio,
    label: 'Text Align',
    options: ['Left', 'Center', 'Right']
  },
];
export  const currentAtAskFields: FieldConfig[] = [
  {type: FieldType.Checkbox, name: 'histogram', options: ['Current At Ask Histogram']},
  {type: FieldType.Color, name: 'level1', label: 'Level 1'},
  {type: FieldType.Color, name: 'level2', label: 'Level 2'},
  {type: FieldType.Color, name: 'level3', label: 'Level 3'},
  {type: FieldType.Color, name: 'level4', label: 'Level 4'},
  {type: FieldType.Color, name: 'level5', label: 'Level 5'},
  {type: FieldType.Color, name: 'level6', label: 'Level 6'},
  {type: FieldType.Color, name: 'level7', label: 'Level 7'},
  {type: FieldType.Color, name: 'level8', label: 'Level 8'},
  {type: FieldType.Color, name: 'tailBidFore', label: 'Tail Inside Ask Fore'},
  {type: FieldType.Color, name: 'tailBidBold', label: 'Tail Inside Ask Bold'},
  {type: FieldType.Color, name: 'backgroundColor', label: 'Background Color'},
  {type: FieldType.Color, name: 'fontColor', label: 'Font Color'},
  {type: FieldType.Color, name: 'insideBackgroundColor', label: 'Inside Ask Background Color'},
  {type: FieldType.Color, name: 'highlightBackgroundColor', label: 'Highlight Background Color'},
  {type: FieldType.Color, name: 'highlightBackgroundColor', label: 'Histogram Color'},
  {type: FieldType.Checkbox, name: 'tail', options: ['Tail Inside Ask Fore', 'Tail Inside Ask Bold']},
  {
    name: 'textAlign',
    type: FieldType.Radio,
    label: 'Text Align',
    options: ['Left', 'Center', 'Right']
  },
];
