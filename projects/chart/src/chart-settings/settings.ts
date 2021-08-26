import { OrderDuration } from 'trading';

export const chartReceiveKey = 'chartReceiveKey';
export const chartSettings = 'chartSettings';

export interface IChartSettings {
  general: {
    upCandleColor: string;
    downCandleColor: string;
    upCandleBorderColor: string;
    downCandleBorderColor: string;
    upCandleBorderColorEnabled: boolean;
    downCandleBorderColorEnabled: boolean;
    lineColor: string;
    wickColor: string;
    gradient1: string;
    gradient2: string;
    valueScaleColor: string;
    dateScaleColor: string;
    gridColor: string;
    font: {
      fontFamily: string;
      fontSize: number;
      textColor: string;
    }
  };
  trading: any;
  valueScale?: {
    valueScale: {
      pixelsPrice: number;
    }
  };
}

export interface IChartSettingsState {
  settings: IChartSettings;
  linkKey: string;
}

export let defaultChartSettings: IChartSettings;
defaultChartSettings = {
  general: {
    upCandleColor: '#4895F5',
    downCandleColor: '#C93B3B',
    upCandleBorderColor: '#D0D0D2',
    downCandleBorderColor: '#D0D0D2',
    upCandleBorderColorEnabled: false,
    downCandleBorderColorEnabled: false,
    lineColor: '#fff',
    wickColor: '#fff',
    gradient1: 'rgb(27, 29, 34)',
    gradient2: 'rgb(27, 29, 34)',
    valueScaleColor: 'rgb(27, 29, 34)',
    dateScaleColor: 'rgb(27, 29, 34)',
    gridColor: '#24262C',
    font: {
      fontFamily: 'Arial',
      fontSize: 10,
      textColor: '#fff'
    }
  },
  trading: {
    orderArea: {
      settings: {
        cancelButton: {
          background: '#51535A',
          enabled: true,
          font: '#D0D0D2',
        },
        closePositionButton: {
          background: '#51535A',
          enabled: true,
          font: '#D0D0D2',
        },
        flatten: {
          background: '#51535A',
          enabled: true,
          font: '#D0D0D2',
        },
        icebergButton: {
          background: '#51535A',
          enabled: true,
          font: '#fff',
        },
        sellMarketButton: {
          background: '#C93B3B',
          enabled: true,
          font: '#D0D0D2',
        },
        buyMarketButton: {
          background: '#4895F5',
          enabled: true,
          font: '#D0D0D2',
        },

      }
    },
    ordersColors: {
      buy: {
        limit: {
          length: 1,
          lineColor: '#4895F5',
          lineType: 'dashed',
        },
        market: {
          length: 1,
          lineColor: '#4895F5',
          lineType: 'dashed',
        },
        stop: {
          length: 1,
          lineColor: '#33537C',
          lineType: 'solid',
        },
        stopLimit: {
          length: 1,
          lineColor: '#33537C',
          lineType: 'dotted',
        },
      },
      ocoStopLimit: '#FFFF00',
      ocoStopOrder: '#FFFF00',
      sell: {
        limit: {
          length: 1,
          lineColor: '#FF0000',
          lineType: 'dashed',
        },
        market: {
          length: 1,
          lineColor: '#FF0000',
          lineType: 'dashed',
        },
        stop: {
          length: 1,
          lineColor: '#C93B3B',
          lineType: 'solid',
        },
        stopLimit: {
          length: 1,
          lineColor: '#C93B3B',
          lineType: 'dotted',
        },
      },
    },
    tif: {
      DAY: true,
      FOK: true,
      GTC: true,
      IOC: true,
      default: OrderDuration.DAY,
    },
    trading: {
      bracketButton: true,
      orderBarLength: 100,
      orderBarUnit: 'pixels',
      showInstrumentChange: false,
      showOHLVInfo: false,
      showWorkingOrders: true,
      tradingBarLength: 40,
      tradingBarUnit: 'pixels',
    }
  },
  valueScale: {
    valueScale: {
      pixelsPrice: 0
    }
  }
};
