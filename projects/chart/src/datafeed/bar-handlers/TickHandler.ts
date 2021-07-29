import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class TickHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Last;

  _processRealtimeBar(bar: IBar) {
    const lastBar = this.getLastBar();

    return this._calculateBarAction(lastBar);
  }

  _calculateBarAction(bar) {
   return bar.ticksCount >= this.chart.timeFrame.interval ? BarAction.Add : BarAction.Update;
  }
}

