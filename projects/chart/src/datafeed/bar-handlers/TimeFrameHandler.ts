import { IBar } from 'chart';
import { BarAction, ChartBarHandler } from './ChartBarHandler';

export class TimeFrameBarHandler extends ChartBarHandler {
  breakOnNewDay = false;

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    const currentBarStartTimestamp = lastBar.date.getTime();
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
    return bars;
  }

  protected _calculateBarAction(bar) {
  }
}
