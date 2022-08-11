import {BarAction, ChartBarHandler} from './ChartBarHandler';
import {IBar} from 'chart';

export class RevsBarHandler extends ChartBarHandler {
  isUp = true;

  _processRealtimeBar(bar: IBar, lastBar = this.getLastBar()): BarAction {
    return this._calculateBarAction(bar, lastBar);
  }

  setAdditionalInfo(additionalInfo: any): void {
    this.isUp = additionalInfo.isUp;
  }

  protected _calculateBarAction(bar: IBar, lastBar: IBar): BarAction {
    if (lastBar.date.getDate() !== bar.date.getDate())
      return BarAction.Add;

    const offset: number = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    if (this.isUp)
      if ((bar.close - (lastBar.high - offset)) <= 0) {
        this.isUp = false;
        return BarAction.Add;
      } else {
        // if uncommented, the Zigzag indicator returns infinity, because this sums last Bar and new Bar in recursion for realtime
        // this.updateLastBar(this._mapLastBar(bar, lastBar, true));
        return BarAction.Update;
      }
    else {
      if (bar.close - (lastBar.low + offset) >= 0) {
        this.isUp = true;
        return BarAction.Add;
      } else {
        // if uncommented, the Zigzag indicator returns infinity, because this sums last Bar and new Bar in recursion for realtime
        // this.updateLastBar(this._mapLastBar(bar, lastBar, true));
        return BarAction.Update;
      }
    }
  }

  processBars(bars: IBar[]): IBar[] {
    return bars;
    // if (!bars?.length)
    //   return [];
    //
    // const resultBars = [];
    // let lastBar;
    //
    // let arrayStarter = 0;
    // if (!lastBar) {
    //   lastBar = bars[0];
    //   arrayStarter++;
    // }
    // resultBars.push(lastBar);
    // for (let i = arrayStarter; i < bars.length; i++) {
    //   lastBar = resultBars[resultBars.length - 1] ?? bars[i];
    //   const bar = bars[i];
    //   const action: BarAction = this._calculateBarAction(bar, lastBar);
    //   if (action === BarAction.Add) {
    //     resultBars.push(bar);
    //     lastBar = bar;
    //   } else if (action === BarAction.Update) {
    //     lastBar = this._mapLastBar(bar, lastBar, true);
    //     resultBars[resultBars.length - 1] = lastBar;
    //   }
    // }
    // return resultBars;
  }

  clear(): void {
    super.clear();
    this.isUp = true;
  }
}

