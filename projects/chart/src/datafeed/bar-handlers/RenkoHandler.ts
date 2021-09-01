import { IBar } from 'chart';
import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';

export class RenkoBarHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Bar;

  protected _calculateBarAction(bar) {
    const prependedBar = this._mapPrependedBar(bar);
    return this.__calculateBarAction(bar, prependedBar);
  }

  private __calculateBarAction(bar, lastBar) {
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    return (bar.close >= (lastBar.open + offset)) ||
    (bar.close <= (lastBar.open - offset)) ? BarAction.Add : BarAction.Update;
  }

  protected _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()): BarAction {
    return this.__calculateBarAction(bar, lastBar);
  }
}

