import { TimeFrameBarHandler } from './TimeFrameHandler';
import { TickHandler } from './TickHandler';
import { RenkoBarHandler } from './RenkoHandler';
import { RevsBarHandler } from './RevsHandler';
import { VolumeHandler } from './VolumeHandler';
import { RangeBarHandler } from './RangeHandler';
import { IBar, IChart } from '../../models/chart';
import { StockChartXPeriodicity } from '../TimeFrame';

export interface IBarHandler {
  insertBar(bar: IBar);

  processBar(bar: IBar);

  prependBar(bar: IBar);

  clear(): void;
}


export class BarHandler implements IBarHandler {
  private _chart: IChart;

  timeFrameHandler: IBarHandler;
  tickHandler: IBarHandler;
  renkoBarHandler: IBarHandler;
  rangeBarHandler: IBarHandler;
  revsBarHandler: IBarHandler;
  volumeHandler: IBarHandler;
  handlers;


  constructor(chart: IChart) {
    this._chart = chart;
    this.timeFrameHandler = new TimeFrameBarHandler(chart);
    this.tickHandler = new TickHandler(chart);
    this.renkoBarHandler = new RenkoBarHandler(chart);
    this.rangeBarHandler = new RangeBarHandler(chart);
    this.revsBarHandler = new RevsBarHandler(chart);
    this.volumeHandler = new VolumeHandler(chart);
    this.handlers = {
      [StockChartXPeriodicity.SECOND]: this.timeFrameHandler,
      [StockChartXPeriodicity.MINUTE]: this.timeFrameHandler,
      [StockChartXPeriodicity.HOUR]: this.timeFrameHandler,
      [StockChartXPeriodicity.DAY]: this.timeFrameHandler,
      [StockChartXPeriodicity.WEEK]: this.timeFrameHandler,
      [StockChartXPeriodicity.MONTH]: this.timeFrameHandler,
      [StockChartXPeriodicity.YEAR]: this.timeFrameHandler,

      [StockChartXPeriodicity.TICK]: this.tickHandler,
      [StockChartXPeriodicity.VOLUME]: this.volumeHandler,
      [StockChartXPeriodicity.RENKO]: this.renkoBarHandler,
      [StockChartXPeriodicity.RANGE]: this.rangeBarHandler,
      [StockChartXPeriodicity.REVS]: this.revsBarHandler,
    };
  }

  private getHandler(): IBarHandler | null {
    const handler = this.handlers[this._chart.timeFrame.periodicity];
    if (!handler)
      console.error(`Handler for ${ this._chart.timeFrame.periodicity } not found`);

    return handler;
  }

  insertBar(bar: IBar) {
    const handler = this.getHandler();
    handler?.insertBar(bar);
  }

  prependBar(bar: IBar) {
    const handler = this.getHandler();
    handler?.prependBar(bar);
  }

  processBar(bar: IBar) {
    const handler = this.getHandler();
    handler?.processBar(bar);
  }

  clear() {
    this.timeFrameHandler.clear();
    this.rangeBarHandler.clear();
    this.revsBarHandler.clear();
    this.renkoBarHandler.clear();
    this.volumeHandler.clear();
    this.tickHandler.clear();
  }
}

