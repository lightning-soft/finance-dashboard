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
  trading: {
    orderArea: any;
    ordersColors: any;
    trading: any;
  };
}

export interface IChartSettingsState {
  settings: IChartSettings;
  linkKey: string;
}

export const defaultChartSettings: IChartSettings = {
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
      buyButtonsBackgroundColor: '#4895F5',
      flatButtonsBackgroundColor: '#51535A',
      buyButtonsFontColor: '#fff',
      flatButtonFontColor: '#D0D0D2',
      sellButtonsBackgroundColor: '#C93B3B',
      cancelButtonBackgroundColor: '#51535A',
      sellButtonsFontColor: '#fff',
      cancelButtonFontColor: '#fff',
      formSettings: {
        showInstrumentChange: false,
        closePositionButton: true,
        showOHLVInfo: false,
        showFlattenButton: true,
        showPLInfo: true,
        showIcebergButton: true,
        roundPL: false,
        includeRealizedPL: false
      },
    },
    ordersColors: {
      limit: {
        lineType: 'dashed',
        lineColor: 'rgb(255,161,109,1)',
        length: 150,
        lengthUnit: 'pixels'
      },
      market: {
        lineType: 'dotted',
        lineColor: 'rgb(101,231,13)',
        length: 120,
        lengthUnit: 'pixels'
      },
      stopLimit: {
        lineType: 'dotted',
        lineColor: 'rgb(58,234,228,1)',
        length: 160,
        lengthUnit: 'pixels'
      },
      stop: {
        lineType: 'solid',
        lineColor: 'rgb(72,149,245,1)',
        length: 120,
        lengthUnit: 'pixels'
      },
      oco: {
        lineType: 'solid',
        lineColor: '#BE3CB1',
        length: 4,
        lengthUnit: 'pixels'
      }
    },
    trading: {
      chartMarker: true,
      tradingBarUnit: 'pixels',
      plUnit: 'points',
      tradingBarLength: 40,
      showWorkingOrders: true,
    }
  }
};
