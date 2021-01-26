import { Column } from 'data-grid';
import * as merge from 'deepmerge';
import { TextAlign } from 'dynamic-form';
import { HistogramOrientation } from './settings-fields';
import { KeyBinding, KeyBindingPart, KeyCode } from 'keyboard';

function getKeyBindings(keyCodes = []) {
  return new KeyBinding(keyCodes.map(item => KeyBindingPart.fromKeyCode(item))).toDTO();
}

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
    autoCenter: false,
    centerLine: false,
    clearCurrentTrades: false,
    clearTotalTrades: false,
    closeOutstandingOrders: false,
    commonView: { autoCenterTicks: 10, ticksPerPrice: 5 },
    'depth&Market': {
      bidAskDeltaDepth: 9, marketDepth: 9,
      showDepthHistory: false,
      bidAskDeltaFilter: 8
    },
    digitsToHide: 6,
    hideAccountName: true,
    hideFromLeft: true,
    hideFromRight: true,
    intervals: {
      clearTradersTimer: 8,
      updateInterval: 8,
      orderQuantityStep: 7,
      scrollWheelSensitivity: 6,
      momentumIntervalMs: 8,
      printOutlines: false,
      momentumTails: false,
    },
    onTop: true,
    recenter: true,
    resetOnNewSession: true,
    useCustomTickSize: true,
  };
  hotkeys: any = {
    autoCenter: getKeyBindings([KeyCode.KEY_R, KeyCode.KEY_T]),
  };
  // columns: any = {};
  common: any = {
    askDelta: false,
    askDepth: false,
    bidDelta: false,
    bidDepth: false,
    currentTradesAtAsk: false,
    currentTradesAtBit: false,
    generalColors: {
      centerLineColor: 'transparent',
      gridLineColor: 'transparent',
      orderGridLineColor: 'transparent',
      simulationModeWarningClr: 'transparent',
    },
    fontFamily: 'Open Sans',
    fontSize: 14,
    fontWeight: '400',
    lqt: false,
    mergeDelta: false,
    notes: false,
    orders: false,
    price: false,
    totalAtAsk: false,
    totalAtBid: false,
    volume: false,
  };
  ltq: any = {
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
    backgroundColor: 'transparent',
    buyBackgroundColor: 'transparent',
    color: 'white',
    accumulateTrades: false,
    histogramColor: 'rgba(56, 58, 64, 0.5)',
    sellBackgroundColor: 'transparent',
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
    backgroundColor: 'rgba(16, 17, 20, 1)',
    color: 'rgba(208, 208, 210, 1)',
    highlightBackgroundColor: 'transparent',
    lastTradedPriceColor: 'transparent',
    nonTradedPriceBackColor: 'transparent',
    nonTradedPriceColor: 'transparent',
    textAlign: TextAlign.Center,
    tradedPriceBackColor: 'transparent',
  };
  bidDelta: any = {
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    color: 'white',
    textAlign: TextAlign.Center,
  };
  askDelta: any = {
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Center,
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    color: '#ffffff',
  };
  bid: any = {
    color: 'white',
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left,
    'font-size': 14,
    highlightLargeBids: false,
    histogramColor: 'rgba(72,149,245,0,3)',
    histogramEnabled: false,
    totalFontColor: 'transparent',
  };
  ask: any = {
    color: 'white',
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    histogramColor: 'rgba(201, 59, 59, 0.2)',
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left,
    'font-size': 14,
    highlightLargeBids: false,
    histogramEnabled: false,
    totalFontColor: 'transparent',
  };
  bidDepth: any = {
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    histogramColor: 'rgba(201, 59, 59, 0.2)',
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left,
    color: '#ffffff',
    'font-size': 14,
    highlightLarge: false,
    histogramEnabled: false,
    totalFontColor: 'transparent',
  };
  askDepth: any = {
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  totalAsk: any = {
    histogramColor: 'rgba(72, 149, 245, 0.3)',
    textAlign: TextAlign.Right,
    color: 'rgba(72, 149, 245, 1)',
    backgroundColor: 'transparent',
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
    histogramOrientation: HistogramOrientation.Left,
  };
  totalBid: any = {
    histogramColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Left,
    color: 'rgba(235, 90, 90, 1)',
    backgroundColor: 'transparent',
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
    histogramOrientation: HistogramOrientation.Right,
  };
  volume: any = {
    highlightBackgroundColor: '#9D0A0A',
    textAlign: TextAlign.Center,
    backgroundColor: 'transparent',
    areaColor: 'transparent',
    color: 'white',
    histogramColor: 'rgba(73, 187, 169, 0.5)',
    histogramOrientation: HistogramOrientation.Right,
    VWAP: false,
    controlColor: 'transparent',
    histogramEnabled: false,
    ltq: false,
    poc: false,
    vWAPColor: 'transparent',
    valueArea: false
  };
  order: any = {
    backgroundColor: 'transparent',
    textAlign: TextAlign.Center,
    'break-evenBackground': 'transparent',
    'break-evenForeground': 'transparent',
    buyOrderBackground: 'transparent',
    buyOrderForeground: 'transparent',
    buyOrdersColumn: 'transparent',
    highlightColor: 'transparent',
    inProfitBackground: 'transparent',
    inProfitForeground: 'transparent',
    lossBackground: 'transparent',
    lossForeground: 'transparent',
    sellOrderBackground: 'transparent',
    sellOrderForeground: 'transparent',
    sellOrdersColumn: 'transparent',
    snowPnl: false,
    split: false,
    includePnl: false,
    overlay: false,
  };
  currentBid: any = {
    color: '#EB5A5A',
    histogramColor: 'rgba(201, 59, 59, 0.4)',
    backgroundColor: 'transparent',
    highlightBackgroundColor: 'rgba(201, 59, 59, 0.4)',
    histogramEnabled: false,
    insideBidBackgroundColor: 'transparent',
    tailInsideAskFore: 'transparent',
    tailInsideBidFore: false,
    tailsBackgroundColors: {
      level1: 'transparent',
      level2: 'transparent',
      level3: 'transparent',
      level4: 'transparent',
      level5: 'transparent',
      level6: 'transparent',
      level7: 'transparent',
      level8: 'transparent',
    },
    textAlign: TextAlign.Center,
  };
  note: any = {
    addedOrdersColor: 'transparent',
    askVolumeColor: 'transparent',
    backgroundColor: 'transparent',
    bidVolumeColor: 'transparent',
    color: 'white',
    highlightBackgroundColor: 'transparent',
    pulledOrdersColor: 'transparent',
  };
  currentAsk: any = {
    color: '#4895F5',
    histogramColor: 'rgba(72, 149, 245, 0.4)',
    backgroundColor: 'transparent',
    highlightBackgroundColor: 'rgba(72, 149, 245, 0.4)',
    histogramEnabled: false,
    insideBidBackgroundColor: 'transparent',
    tailInsideAskFore: 'transparent',
    tailInsideBidFore: false,
    tailsBackgroundColors: {
      level1: 'transparent',
      level2: 'transparent',
      level3: 'transparent',
      level4: 'transparent',
      level5: 'transparent',
      level6: 'transparent',
      level7: 'transparent',
      level8: 'transparent',
    },
    textAlign: TextAlign.Center,
  };

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
    }

    console.log(data);
  }

  private _setDataToColumns() {
    this.merge(this);
  }

  toJson() {
    return merge({}, this as any);
  }
}
