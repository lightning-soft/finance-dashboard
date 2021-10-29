import { BarAction, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class VolumeHandler extends ChartBarHandler {
  protected _shouldUpdateLastDate = true;

  processBars(bars: IBar[]) {
    return bars;
  }

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(bar) {
    const offset = this.chart.timeFrame.interval;
    return (bar.volume >= offset) ? BarAction.Add : BarAction.Update;
  }
}

