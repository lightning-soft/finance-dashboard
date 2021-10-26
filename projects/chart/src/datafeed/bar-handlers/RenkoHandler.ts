import {IBar} from 'chart';
import {BarAction, ChartBarHandler} from './ChartBarHandler';

export class RenkoBarHandler extends ChartBarHandler {

  private __calculateBarAction(bar, lastBar) {
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    const isUp = lastBar.close > lastBar.open;
    if (isUp) {
      return lastBar.close - lastBar.open >= offset || lastBar.open - lastBar.close >= 2 * offset ? BarAction.Add : BarAction.Update;
    }
    return lastBar.close - lastBar.open >= 2 * offset || lastBar.open - lastBar.close >= offset ? BarAction.Add : BarAction.Update;
  }

  protected _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()): BarAction {
    return this.__calculateBarAction(bar, lastBar);
  }

  clear() {
    super.clear();
  }
}

