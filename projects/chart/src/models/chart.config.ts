import { IDatafeed, IStockChartXInstrument, IStockChartXTimeFrame } from '../datafeed';

export interface IChartConfig {
  datafeed?: IDatafeed;
  barsCount?: number;
  container?: JQuery;
  width?: number;
  height?: number;
  timeInterval?: number;
  timeFrame?: IStockChartXTimeFrame;
  theme?: any;
  instrument?: IStockChartXInstrument;
  priceStyle?: string;
  crossHair?: string;
  showToolbar?: boolean;
  showNavigation?: boolean;
  showScrollbar?: boolean;
  fullWindowMode?: boolean;
  onToolbarLoaded?: any;
  onScrollbarLoaded?: any;
  autoSave?: boolean;
 // stateHandler?: IChartStateHandler;
  keyboardEventsEnabled?: boolean;
}
