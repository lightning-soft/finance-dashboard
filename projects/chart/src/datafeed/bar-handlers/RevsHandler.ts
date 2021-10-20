import { BarAction, CalculationBarType, ChartBarHandler } from './ChartBarHandler';
import { IBar } from 'chart';

export class RevsBarHandler extends ChartBarHandler {
  calculatePrependedBar = CalculationBarType.Mapped;
  isUp = true;

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()) {
    return this._calculateBarAction(bar, lastBar);
  }


  protected _calculateBarAction(bar, lastBar) {
    if (lastBar.date.getDate() !== bar.date.getDate())
      return BarAction.Add;

    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    if (this.isUp)
      if ((bar.close - (lastBar.high - offset)) <= 0) {
        this.isUp = false;
        return BarAction.Add;
      } else
        return BarAction.Update;
    else {
      if (bar.close - (lastBar.low + offset) >= 0) {
        this.isUp = true;
        return BarAction.Add;
      }
      return BarAction.Update;
    }
  }

  processBars(bars: IBar[]): IBar[] {
    if (!bars?.length)
      return [];

    const resultBars = [];
    let lastBar;

    let arrayStarter = 0;
    if (!lastBar) {
      lastBar = bars[0];
      arrayStarter++;
    }
    resultBars.push(lastBar);
    for (let i = arrayStarter; i < bars.length; i++) {
      lastBar = resultBars[resultBars.length - 1] ?? bars[i];
      const bar = bars[i];
      const action: BarAction = this._calculateBarAction(bar, lastBar);
      if (action === BarAction.Add) {
        resultBars.push(bar);
        lastBar = bar;
      } else if (action === BarAction.Update) {
        lastBar = this._mapLastBar(bar, lastBar, true);
        resultBars[resultBars.length - 1] = lastBar;
      }
    }
    return resultBars;
  }

  clear() {
    super.clear();
    this.isUp = true;
  }
}

