import { IBarHandler } from './BarHandler';
import { IBar, IChart } from '../../models/chart';

export enum CalculationBarType {
  Bar, Last, Mapped
}

export abstract class ChartBarHandler implements IBarHandler {
  protected chart: IChart;
  protected _shouldUpdateLastDate = false;
  breakOnNewDay = true;
  protected _lastDate;

  constructor(chart: IChart) {
    this.chart = chart;
  }

  insertBar(bar: IBar) {
    this.processBar(bar);
  }

  processBar(bar: IBar): { action: BarAction, bar } {
    const lastBar = this.getLastBar();

    if (!lastBar) {
      this.chart.appendBars(bar);

      return { bar, action: BarAction.Add };
    }

    const action: BarAction = this._processRealtimeBar(bar);
    if (action === BarAction.Add) {
      this.addBar(bar);
      return { bar, action: BarAction.Add };
    } else if (action === BarAction.Update) {
      this.updateLastBar(bar);
      return { bar, action: BarAction.Update };
    } else {
      return { bar, action: BarAction.None };
    }
  }

  processBars(bars: IBar[], lastBar = this.getLastBar()): IBar[] {
    if (!bars?.length)
      return [];

    // console.time('bars');
    const resultBars = [];

    let arrayStarter = 0;
    if (!lastBar) {
      lastBar = bars[0];
      arrayStarter++;
    }
    resultBars.push(lastBar);
    for (let i = arrayStarter; i < bars.length; i++) {
      const bar = bars[i];
      const addNewBarFlag = this.breakOnNewDay && lastBar.date.getDate() !== bar.date.getDate();

      if (addNewBarFlag) {
        resultBars.push(bar);
        lastBar = bar;
        continue;
      }

      const action: BarAction = this._processRealtimeBar(bar, lastBar);
      if (action === BarAction.Add) {
        resultBars.push(bar);
        lastBar = bar;
      } else if (action === BarAction.Update) {
        lastBar = this._mapLastBar(bar, lastBar, true);
        resultBars[resultBars.length - 1] = lastBar;
      }
    }
    // console.timeEnd('bars');
    return resultBars;
  }

  prependBars(bars: IBar[]): IBar[] {
    if (!bars?.length)
      return [];

    const [lastPrependedBar, ...items] = bars;
    return this.processBars(items, lastPrependedBar);
  }

  setAdditionalInfo(additionalInfo: any) {
  }


  protected _processRealtimeBar(bar: IBar, lastBar?: IBar) {
    return BarAction.Add;
  }

  clear() {
  }

  getLastBar() {
    return this.chart.dataManager.getLastBar();
  }

  addBar(bar: IBar) {
    this.chart.dataManager.appendBars(bar);
  }

  updateLastBar(bar: IBar): IBar {
    const lastBar = this._mapLastBar(bar);
    this.chart.dataManager.updateLastBar(lastBar);
    return lastBar;
  }

  updateLastBarDate(date: Date) {
    const lastBar = this.getLastBar();
    lastBar.date = date;
    this.updateLastBar(lastBar);
  }

  protected _mapLastBar(bar: IBar, lastBar = this.chart.dataManager.getLastBar(), calcTicks = false) {

    const price = bar.close;
    if (price > lastBar.high)
      lastBar.high = price;
    if (price < lastBar.low)
      lastBar.low = price;
    lastBar.close = price;
    lastBar.volume += bar.volume;

    if (calcTicks) {
      if (lastBar.ticksCount == null)
        lastBar.ticksCount = 1;
      lastBar.ticksCount++;
    }
    if (this._shouldUpdateLastDate) {
      lastBar.date = bar.date;
    }

    return lastBar;
  }

  protected _mapPrependedBar(bar: IBar) {
    const mappedBar = { ...bar };

    return mappedBar;
  }
}

export enum BarAction {
  Add, Update, None
}
