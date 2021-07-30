import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class RevsBarHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Mapped;

  _processRealtimeBar(bar: IBar) {
    const lastBar = this._mapLastBar(bar);
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(lastBar) {
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);

    return ((lastBar.close - (lastBar.high - offset)) <= 0)
    || (lastBar.close - (lastBar.low + offset) >= 0) ? BarAction.Add : BarAction.Update;
  }
}

