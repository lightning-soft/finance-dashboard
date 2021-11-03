import { IBar, StockChartXPeriodicity } from 'chart';
import { BarAction, ChartBarHandler } from './ChartBarHandler';

export class TimeFrameBarHandler extends ChartBarHandler {
  breakOnNewDay = false;

  // _shouldUpdateLastDateAfterAdd = true;

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    /*    switch (this.chart.timeFrame.periodicity) {
          case StockChartXPeriodicity.SECOND:
            lastBar.date.setMilliseconds(0);
            break;
          case StockChartXPeriodicity.MINUTE:
            lastBar.date.setSeconds(0);
            break;
          case StockChartXPeriodicity.HOUR:
            lastBar.date.setMinutes(0, 0, 0);
            break;
        }*/
 /*   const currentBarStartTimestamp = lastBar.date.getTime();
    let nextBarStartTimestamp = (currentBarStartTimestamp as number) + (this.chart.timeInterval as number);
    const nextBarStartDate = new Date(nextBarStartTimestamp);
    if (bar.date.getTime() < currentBarStartTimestamp || bar.close === 0)
      return BarAction.None;
    if ((new Date(bar.date) >= nextBarStartDate)) {
      // If there were no historical data and timestamp is in range of current time frame
      if (bar.date < nextBarStartDate)
        nextBarStartTimestamp = currentBarStartTimestamp;

      // If gap is more than one time frame
      while (bar.date.getTime() >= ((nextBarStartTimestamp as number) + (this.chart.timeInterval as number)))
        nextBarStartTimestamp += this.chart.timeInterval;

      bar.date = new Date(nextBarStartTimestamp + 1);
      this._lastDate = new Date(nextBarStartTimestamp);
      return BarAction.Add;
    } else {
      return BarAction.Update;
    }*/
        switch (this.chart.timeFrame.periodicity) {
            case StockChartXPeriodicity.SECOND:
              lastBar.date.setMilliseconds(0);
              break;
            case StockChartXPeriodicity.MINUTE:
              lastBar.date.setSeconds(0);
              break;
            case StockChartXPeriodicity.HOUR:
              lastBar.date.setMinutes(0, 0, 0);
              break;
          case StockChartXPeriodicity.DAY:
            lastBar.date.setHours(0, 0, 0, 0);
          }
     const currentBarStartTimestamp = lastBar.date.getTime();
     let nextBarStartTimestamp = (currentBarStartTimestamp as number) + (this.chart.timeInterval as number);
     const nextBarStartDate = new Date(nextBarStartTimestamp);
     /*  if (bar.date.getTime() < currentBarStartTimestamp || bar.close === 0)
         return BarAction.None;*/
     if (bar.date.getTime() >= currentBarStartTimestamp) {
       // If there were no historical data and timestamp is in range of current time frame
       /* if (bar.date < nextBarStartDate)
          nextBarStartTimestamp = currentBarStartTimestamp;*/

       // If gap is more than one time frame
       while (bar.date.getTime() >= ((nextBarStartTimestamp as number) + (this.chart.timeInterval as number)))
         nextBarStartTimestamp += this.chart.timeInterval;

       bar.date = new Date(nextBarStartTimestamp);
       return BarAction.Add;
     } else {
       return BarAction.Update;
     }

  }

  insertBar(bar: IBar) {
    this.addBar(bar);
  }

  // Do not process bars in super.processFunction, it can faced with some issues with merge latest few bars
  // Remove completely this method if all custom time frames will be calculated on the server
  processBars(bars) {
    // return bars;
    if (bars.length > 2) {
      const lastBar = bars[bars.length - 1];
      const beforeLastBar = bars[bars.length - 2];
      if (lastBar.date.getTime() < beforeLastBar.date.getTime() + this.chart.timeInterval) {
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
