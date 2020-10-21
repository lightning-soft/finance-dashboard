import {IStockChartXInstrument} from '../datafeed/IInstrument';
import {IStockChartXTimeFrame} from '../datafeed/models';

export interface IStockChartXState {
  chart: any;
  priceStyle: any;
  dateScale: any;
  valueScales: any;
  crossHair: any;
  chartPanelsContainer: any;
  instrumentComparisonHandler: any;
  indicators: any;
  drawings: any;
}

export interface IScxComponentState {
  stockChartXState: IStockChartXState;
  instrument: IStockChartXInstrument;
  timeFrame: IStockChartXTimeFrame;
}
