import { IBar } from 'chart';
import { BarAction, ChartBarHandler } from './ChartBarHandler';

declare let StockChartX: any;
export class TimeFrameBarHandler extends ChartBarHandler {
  breakOnNewDay = false;

  // Changing intervals is necessary to make bars look like im other platforms (RTrader).
  // in small time intervals (second, minute, hour) last bar shows ahead of time?,
  // and the previous bar shows current time frame. So there is need to shift dates and calculate bar action in different way.
  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    const currentBarStartTimestamp = lastBar.date.getTime();
    let interval = (this.chart.timeInterval as number);

    const isSmallInterval = [StockChartX.Periodicity.HOUR, StockChartX.Periodicity.MINUTE,
      StockChartX.Periodicity.SECOND].includes(this.chart.timeFrame.periodicity);

    if (isSmallInterval)
      interval = 0;
    let nextBarStartTimestamp = (currentBarStartTimestamp as number) + interval;
    const nextBarStartDate = new Date(nextBarStartTimestamp);

    switch (this.chart.timeFrame.periodicity) {
      case StockChartX.Periodicity.HOUR:
        nextBarStartDate.setMinutes(0);
        nextBarStartDate.setSeconds(0);
        nextBarStartDate.setMilliseconds(0);
        break;
      case StockChartX.Periodicity.MINUTE:
        nextBarStartDate.setSeconds(0);
        nextBarStartDate.setMilliseconds(0);
        break;
      case StockChartX.Periodicity.SECOND:
        nextBarStartDate.setMilliseconds(0);
        break;
      default:
        break;
    }
    /*   if (bar.date.getTime() < currentBarStartTimestamp || bar.close === 0)
         return BarAction.None;*/
    if ((bar.date >= nextBarStartDate)) {

      // If gap is more than one time frame
      while (bar.date.getTime() >= ((nextBarStartTimestamp as number) + (this.chart.timeInterval as number)))
        nextBarStartTimestamp += this.chart.timeInterval;

      bar.date = new Date(nextBarStartTimestamp + (isSmallInterval ? this.chart.timeInterval : 0));
      return BarAction.Add;
    } else {
      return BarAction.Update;
    }

  }

  insertBar(bar: IBar) {
    this.addBar(bar);
  }


  processBars(bars) {
    // Need to round last bar to time interval.
    // For example time interval is 1min, bar before last has date 16.44.00 and last bar 16.44.24,
    // Then last bar will be rounded to 16.45/
    if (bars.length > 2) {
      const lastBar = bars[bars.length - 1];
      const beforeLastBar = bars[bars.length - 2];
      if (lastBar.date.getTime() - beforeLastBar.date.getTime() < this.chart.timeInterval) {
        const currentBarStartTimestamp = beforeLastBar.date.getTime();
        const nextBarStartTimestamp = (currentBarStartTimestamp as number) + (this.chart.timeInterval as number);
        lastBar.date = new Date(nextBarStartTimestamp);
      }
    }
    return bars;
  }

  protected _calculateBarAction(bar) {
  }
}
