import { Column, DefaultScrollSensetive } from 'data-grid';
import * as merge from 'deepmerge';
import { TextAlign, HistogramOrientation } from 'dynamic-form';
import { KeyBinding, KeyBindingPart, KeyCode } from 'keyboard';

function getKeyBindings(keyCodes = []) {
  return new KeyBinding(keyCodes.map(item => KeyBindingPart.fromKeyCode(item))).toDTO();
}
const DefaultClearInterval = 2500;

export class DomSettings {
  public set columns(value: Column[]) {
    this._columns = value;
    this._setDataToColumns();
  }

  private _columns: Column[] = [];

  public get columns(): Column[] {
    return this._columns;
  }

  general: any = {
    allWindows: false,
    clearCurrentTrades: false,
    clearTotalTrades: false,
    closeOutstandingOrders: false,
    commonView: {
      autoCenterTicks: 10,
      ticksMultiplier: 2,
      useCustomTickSize: false,
      // onTop: true,
      resetOnNewSession: true,
      autoCenter: false,
      centerLine: true,
    },
    marketDepth: {
      bidAskDeltaDepth: 9,
      marketDepth: 9,
      showDepthHistory: false,
      bidAskDeltaFilter: 0
    },
    digitsToHide: 4,
    hideAccountName: true,
    hideFromLeft: true,
    hideFromRight: false,
    intervals: {
      clearTradersTimer: DefaultClearInterval,
      updateInterval: 100,
      orderQuantityStep: 7,
      scrollWheelSensitivity: DefaultScrollSensetive,
      momentumIntervalMs: 500,
      printOutlines: false,
      momentumTails: true,
    },
  };
  hotkeys: any = {
    quantity1: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_1]),
    quantity2: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_2]),
    quantity3: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_3]),
    quantity4: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_4]),
    quantity5: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_5]),
    autoCenter: getKeyBindings([KeyCode.KEY_A, KeyCode.KEY_C]),
    quantityToPos: getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_P]),
    hitBid: getKeyBindings([KeyCode.KEY_H, KeyCode.KEY_B]),
    joinBid: getKeyBindings([KeyCode.KEY_J, KeyCode.KEY_B]),
    liftOffer: getKeyBindings([KeyCode.KEY_L, KeyCode.KEY_O]),
    joinAsk: getKeyBindings([KeyCode.KEY_J, KeyCode.KEY_A]),
    stopsToPrice: getKeyBindings([KeyCode.KEY_S, KeyCode.KEY_P]),
    stopsToLimit: getKeyBindings([KeyCode.KEY_S, KeyCode.KEY_L]),
    autoCenterAllWindows: getKeyBindings([KeyCode.KEY_A, KeyCode.KEY_W]),
    clearAllTotals: getKeyBindings([KeyCode.KEY_C, KeyCode.KEY_T]),
    clearCurrentTradesDown: getKeyBindings([KeyCode.KEY_C, KeyCode.KEY_D]),
    clearCurrentTradesUp: getKeyBindings([KeyCode.KEY_C, KeyCode.KEY_U]),
    clearVolumeProfile: getKeyBindings([KeyCode.KEY_C, KeyCode.KEY_V]),
    clearTotalTradesDown: getKeyBindings([KeyCode.KEY_T, KeyCode.KEY_D]),
    clearTotalTradesUp: getKeyBindings([KeyCode.KEY_T, KeyCode.KEY_U]),
    clearCurrentTradesAllWindows:
      getKeyBindings([KeyCode.KEY_W, KeyCode.KEY_T]),
    clearCurrentTradesDownAllWindows:
      getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_D, KeyCode.KEY_W]),
    clearCurrentTradesUpAllWindows:
      getKeyBindings([KeyCode.KEY_Q, KeyCode.KEY_U, KeyCode.KEY_W]),
    clearTotalTradesDownAllWindows:
      getKeyBindings([KeyCode.KEY_D, KeyCode.KEY_W]),
    clearTotalTradesUpAllWindows:
      getKeyBindings([KeyCode.KEY_U, KeyCode.KEY_W]),
  };
  // columns: any = {};
  common: any = {
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: '',
    generalColors: {
      centerLineColor: 'grey',
      gridLineColor: '#24262C',
      orderGridLineColor: 'rgba(88, 110, 117, 1)',
      simulationModeWarningClr: 'rgba(4, 63, 128, 1)',
    },
    askDelta: true,
    ask: true,
    bidDelta: true,
    bid: true,
    // currentTradesAtAsk: true,
    // currentTradesAtBid: true,
    ltq: true,
    delta: true,
    notes: true,
    orders: true,
    buyOrders: true,
    sellOrders: true,
    price: true,
    totalAsk: true,
    totalBid: true,
    currentBid: true,
    currentAsk: true,
    volume: true,
  };
  ltq: any = {
    highlightColor: 'rgba(56, 58, 64, 1)',
    // backgroundColor: 'rgba(1, 43, 54, 1)',
    // buyBackgroundColor: 'rgba(72, 149, 245, 1)',
    color: 'white',
    accumulateTrades: true,
    histogramColor: 'rgba(56, 58, 64, 0.5)',
    // sellBackgroundColor: 'rgba(220, 50, 47, 1)',
    textAlign: TextAlign.Center,
  };
  orderArea = {
    buyButtonsBackgroundColor: '#2A8AD2',
    flatButtonsBackgroundColor: '#383A40',
    buyButtonsFontColor: '#F2F2F2',
    flatButtonFontColor: '#fff',
    sellButtonsBackgroundColor: '#DC322F',
    cancelButtonBackgroundColor: '#51535A',
    sellButtonsFontColor: '#F2F2F2',
    cancelButtonFontColor: '#fff',
    formSettings: {
      showInstrumentChange: true,
      closePositionButton: true,
      showOHLVInfo: true,
      showFlattenButton: true,
      showPLInfo: true,
      showIcebergButton: true,
      roundPL: false,
      includeRealizedPL: false
    },
  };
  price: any = {
    color: 'rgba(208, 208, 210, 1)',
    backgroundColor: 'rgba(131, 148, 150, 1)',
    highlightBackgroundColor: 'rgba(88, 110, 117, 1)',
    highlightColor: 'rgba(0, 0, 0, 1)',
    tradedPriceBackgroundColor: 'rgba(16, 17, 20, 1)',
    textAlign: TextAlign.Center,
  };
  bidDelta: any = {
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: '#2b486e',
    color: 'white',
    textAlign: TextAlign.Center,
  };
  askDelta: any = {
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Center,
    highlightBackgroundColor: '#682a2d',
    color: '#ffffff',
  };
  bid: any = {
    color: 'white',
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left,
    largeSize: 14,
    highlightLarge: false,
    histogramColor: 'rgba(72,149,245,0,3)',
    histogramEnabled: true,
    // totalFontColor: 'rgba(255, 255, 0, 1)',
    clearInterval: DefaultClearInterval,
  };
  ask: any = {
    color: 'white',
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    histogramColor: 'rgba(201, 59, 59, 0.2)',
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left,
    largeSize: 14,
    highlightLarge: false,
    histogramEnabled: true,
    // totalFontColor: 'rgba(255, 255, 0, 1)',
    clearInterval: DefaultClearInterval,
  };
  totalAsk: any = {
    histogramColor: 'rgba(72, 149, 245, 0.3)',
    textAlign: TextAlign.Right,
    color: 'rgba(72, 149, 245, 1)',
    backgroundColor: 'transparent',
    // backgroundColor: 'rgba(1, 43, 54, 1)',
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
    histogramOrientation: HistogramOrientation.Left,
  };
  totalBid: any = {
    histogramColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Left,
    color: 'rgba(235, 90, 90, 1)',
    backgroundColor: 'transparent',
    // backgroundColor: 'rgba(1, 43, 54, 1)',
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
    histogramOrientation: HistogramOrientation.Right,
  };
  volume: any = {
    highlightBackgroundColor: '#9D0A0A',
    textAlign: TextAlign.Center,
    backgroundColor: 'transparent',
    lastTradingBackgroundColor: 'white',
    // backgroundColor: 'rgba(1, 43, 54, 1)',
    valueAreaHistogramColor: 'rgba(109, 112, 196, 1)',
    color: 'white',
    histogramColor: 'rgba(73, 187, 169, 0.5)',
    histogramOrientation: HistogramOrientation.Right,
    pointOfControlHistogramColor: 'rgba(211, 53, 130, 1)',
    VWAPHistogramColor: 'rgba(203, 75, 22, 1)',
    VWAP: true,
    histogramEnabled: true,
    ltq: true,
    poc: true,
    valueArea: true,
  };
  orders: any = {
    backgroundColor: 'rgba(0, 44, 55, 1)',
    textAlign: TextAlign.Center,
    // 'break-evenBackground': 'rgba(0, 44, 55, 1)',
    // 'break-evenForeground': 'rgba(255, 255, 255, 1)',
    buyOrderBackgroundColor: 'rgba(22, 140, 213, 1)',
    buyOrderColor: 'rgba(242, 242, 242, 1)',
    // buyOrdersColumn: 'rgba(0, 44, 55, 1)',
    highlightColor: 'rgba(29, 73, 127, 1)',
    inProfitBackgroundColor: 'rgba(0, 44, 55, 1)',
    inProfitColor: 'rgba(72, 149, 245, 1)',
    lossBackgroundColor: 'rgba(0, 44, 55, 1)',
    lossColor: 'rgba(201, 59, 59, 1)',
    sellOrderBackgroundColor: 'rgba(201, 59, 59, 1)',
    sellOrderColor: 'rgba(255, 255, 255, 1)',
    sellOrdersBackgroundColor: 'rgba(255, 255, 255, 0.5)',
    buyOrdersBackgroundColor: 'rgba(22, 140, 213, 0.5)',
    // sellOrdersColumn: 'rgba(72, 149, 245, 1)',
    showPnl: false,
    split: false,
    includePnl: false,
    overlay: false,
  };
  currentBid: any = {
    color: '#EB5A5A',
    histogramColor: 'rgba(201, 59, 59, 0.4)',
    // backgroundColor: 'rgba(1, 43, 54, 1)',
    backgroundColor: 'transparent',
    highlightBackgroundColor: 'rgba(201, 59, 59, 0.4)',
    histogramEnabled: false,
    insideBackgroundColor: 'rgba(0, 0, 0, 1)',
    tailInsideColor: 'rgba(255, 255, 255, 1)',
    tailInsideBold: false,
    level1BackgroundColor: 'rgba(128, 64, 64, 1)',
    level2BackgroundColor: 'rgba(112, 61, 63, 1)',
    level3BackgroundColor: 'rgba(96, 59, 62, 1)',
    level4BackgroundColor: 'rgba(80, 56, 60, 1)',
    level5BackgroundColor: 'rgba(64, 54, 59, 1)',
    level6BackgroundColor: 'rgba(48, 51, 58, 1)',
    level7BackgroundColor: 'rgba(32, 48, 57, 1)',
    level8BackgroundColor: 'rgba(16, 46, 55, 1)',
    textAlign: TextAlign.Center,
  };
  note: any = {
    addedOrdersColor: 'rgba(53, 104, 147, 1)',
    // askVolumeColor: 'rgba(142, 60, 66, 1)',
    backgroundColor: 'transparent',
    // backgroundColor: 'rgba(1, 43, 54, 1)'
    // bidVolumeColor: 'rgba(53, 104, 147, 1)',
    color: 'white',
    // highlightBackgroundColor: 'rgba(88, 110, 117, 1)',
    pulledOrdersColor: 'rgba(143, 60, 65, 1)',
  };
  currentAsk: any = {
    color: '#4895F5',
    histogramColor: 'rgba(4, 63, 128, 1)',
    backgroundColor: 'transparent',
    // backgroundColor: 'rgba(1, 43, 54, 1)'
    histogramEnabled: false,
    insideBackgroundColor: 'rgba(0, 0, 0, 1)',
    highlightBackgroundColor: 'rgba(88, 110, 117, 1)',
    tailInsideColor: 'rgba(255, 255, 255, 1)',
    tailInsideBold: false,
    level1BackgroundColor: 'rgba(4, 63, 128, 1)',
    level2BackgroundColor: 'rgba(3, 60, 119, 1)',
    level3BackgroundColor: 'rgba(3, 59, 110, 1)',
    level4BackgroundColor: 'rgba(2, 56, 100, 1)',
    level5BackgroundColor: 'rgba(2, 54, 91, 1)',
    level6BackgroundColor: 'rgba(2, 51, 82, 1)',
    level7BackgroundColor: 'rgba(1, 48, 73, 1)',
    level8BackgroundColor: 'rgba(1, 46, 63, 1)',
    textAlign: TextAlign.Center,
  };

  delta: any;
  sellOrders: any;
  buyOrders: any;


  static fromJson(json: any): DomSettings {
    const settings = new DomSettings();
    settings.merge(json);
    return settings;
  }


  merge(data: Partial<DomSettings>) {
    for (const key in data) {
      if (!this.hasOwnProperty(key) || key == '_columns' || key == 'columns') {
        console.warn(`Check property ${key} in settings`);
        continue;
      }

      const column = this.columns.find(i => i.name == key);
      // console.log('before', (window as any).grid?.schema[0] == this.columns[0])
      if (column) {
        if (!column.style)
          column.style = {};

        // if (key != '_columns' && key != 'columns')
        Object.assign(column.style, data[key]);
        // console.log((window as any).grid?.scheme[0] == this.columns[0])
      } else {
        console.warn(`Missing column ${key}`);
      }
      Object.assign(this[key], data[key]);
    }

    this.currentAsk.clearInterval = this.general.intervals.clearTradersTimer;
    this.currentBid.clearInterval = this.general.intervals.clearTradersTimer;

    console.log(data);
  }

  private _setDataToColumns() {
    this.merge(this);
  }

  toJson() {
    return merge({}, this as any);
  }
}
