import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class RangeBarHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Last;

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(bar) {
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);

    return ((bar.high - bar.low) >= offset) ? BarAction.Add : BarAction.Update;
  }
}

