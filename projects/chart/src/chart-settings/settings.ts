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
  }
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
    upCandleBorderColorEnabled: true,
    downCandleBorderColorEnabled: true,
    lineColor: '#fff',
    wickColor: '#fff',
    gradient1: '#101114',
    gradient2: '#777',
    valueScaleColor: '#101114',
    dateScaleColor: '#101114',
    gridColor: '#24262C',
    font: {
      fontFamily: 'Arial',
      fontSize: 10,
      textColor: '#fff'
    }
  }
}
