import { BarAction, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class RangeBarHandler extends ChartBarHandler {
  processBars(bars: IBar[], lastBar: any = this.getLastBar()): IBar[] {
    return bars;
  }

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(bar) {
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);

    return (Math.abs(bar.high - bar.low) >= offset) ? BarAction.Add : BarAction.Update;
  }
}

