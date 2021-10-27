import { BarAction, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class TickHandler extends ChartBarHandler {
  processBars(bars: IBar[]): IBar[] {
    return bars;
  }

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(lastBar);
  }

  _calculateBarAction(bar) {
    return bar.ticksCount >= this.chart.timeFrame.interval ? BarAction.Add : BarAction.Update;
  }
}

