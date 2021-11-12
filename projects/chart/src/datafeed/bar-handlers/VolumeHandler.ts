import { BarAction, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class VolumeHandler extends ChartBarHandler {
  protected _shouldUpdateLastDate = false;

  processBars(bars: IBar[]) {
    return bars;
   /* return bars.map((item, index, array) => {
      if (index === 0)
        return item;
      if (item.date === array[index - 1].date)
        item.date = new Date(item.date.getTime() + 1);
      return item;
    });*/
  }

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(bar) {
    const offset = this.chart.timeFrame.interval;
    return (bar.volume >= offset) ? BarAction.Add : BarAction.Update;
  }
}

