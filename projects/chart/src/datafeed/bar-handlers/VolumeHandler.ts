import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class VolumeHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Last;

  _processRealtimeBar(bar: IBar) {
    const lastBar = this.getLastBar();
    return this._calculateBarAction(lastBar);
  }

  protected _calculateBarAction(bar) {
    const offset = this.chart.timeFrame.interval;
    return (bar.volume >= offset) ? BarAction.Add : BarAction.Update;
  }
}

