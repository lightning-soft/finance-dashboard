import { IBar } from 'chart';
import { BarAction, ChartBarHandler } from './ChartBarHandler';

export class RenkoBarHandler extends ChartBarHandler {
  isFirstRealtimeBar = true;

  processBars(bars: IBar[]) {
    this.isFirstRealtimeBar = true;
    return bars;
  }

  processBar(bar: IBar) {
    const lastBar = this.getLastBar();
    const beforeLatBar = this.chart.dataManager.getBeforeLastBar();
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    const resultBars = [];
    if (this.isFirstRealtimeBar) {
      this.addBar(bar);
      this.isFirstRealtimeBar = false;
    }
    const isUp = beforeLatBar.high === beforeLatBar.close;

    if (bar.close >= offset + (isUp ? beforeLatBar.close : beforeLatBar.open)) {
      let isFirstNewBar = true;
      const updatePrice = isUp ? beforeLatBar.close : beforeLatBar.open;
      let newBarOpen = updatePrice + offset;
      let newClose = updatePrice + (offset * 2);
      this.updateLastBar({
        open: updatePrice,
        close: updatePrice + offset,
        date: lastBar.date,
        high: updatePrice + offset,
        low: updatePrice,
        volume: lastBar.volume,
      });
      let timeOffset = 1;
      do {
        resultBars.push({
          open: newBarOpen,
          high: newClose,
          low: newBarOpen,
          close: newClose,
          date: new Date(bar.date.getTime() + timeOffset),
          volume: isFirstNewBar ? bar.volume : 0,
          details: isFirstNewBar ? bar.details : [],
        });
        timeOffset++;
        newBarOpen = newClose;
        newClose += offset;
        isFirstNewBar = false;
      }
      while (lastBar.close >= newClose);
      resultBars.forEach(item => this.addBar(item));

      return { action: BarAction.Add, bar };
    }
    else if (((isUp ? beforeLatBar.open : beforeLatBar.close) - offset) >= bar.close) {
      let isFirstNewBar = true;
      const updatePrice = isUp ? beforeLatBar.open : beforeLatBar.close;
      let newBarOpen = updatePrice - offset;
      let newClose = updatePrice - (offset * 2);
      this.updateLastBar({
        open: updatePrice,
        close: updatePrice - offset,
        date: lastBar.date,
        high: updatePrice,
        low: updatePrice - offset,
        volume: lastBar.volume,
      });
      let timeOffset = 1;
      do {
        newClose = newBarOpen - offset;
        resultBars.push({
          open: newBarOpen,
          high: newBarOpen,
          low: newClose,
          close: newClose,
          date: new Date(bar.date.getTime() + timeOffset),
          volume: isFirstNewBar ? bar.volume : 0,
          details: isFirstNewBar ? bar.details : [],
        });
        timeOffset += 1;
        newBarOpen = newClose;
        newClose -= offset;
        isFirstNewBar = false;
      }
      while (newClose >= bar.close);
      resultBars.forEach(item => this.addBar(item));

      return { action: BarAction.Add, bar };
    } else {
      lastBar.volume += bar.volume;
      lastBar.date = bar.date;
      lastBar.close = bar.close;
      this.updateLastBar(bar, false);

      return { action: BarAction.None, bar };
    }
  }

  updateLastBar(bar: IBar, force = true): IBar {
    const lastBar = force ? bar : this._mapLastBar(bar);
    this.chart.dataManager.updateLastBar(lastBar);
    return lastBar;
  }

  protected _mapLastBar(bar: IBar, lastBar: any = this.chart.dataManager.getLastBar(), calcTicks: boolean = false): any {
    lastBar.volume += bar.volume;
    lastBar.date = bar.date;
    lastBar.close = bar.close;
    if (lastBar.close > lastBar.open) {
      lastBar.high = lastBar.close;
      lastBar.low = lastBar.open;
    } else {
      lastBar.high = lastBar.open;
      lastBar.low = lastBar.close;
    }
    return lastBar;
  }

  clear() {
    this.isFirstRealtimeBar = true;
    super.clear();
  }
}

