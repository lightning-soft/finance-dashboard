import { IBarHandler } from './BarHandler';
import { IBar, IChart } from '../../models/chart';
import { BarsUpdateKind } from '../models';

export enum CalculationBarType {
  Bar, Last, Mapped
}

export abstract class ChartBarHandler implements IBarHandler {
  protected chart: IChart;
  protected lastPrependedBar: IBar;
  protected lastPrependedBarIndex: number;
  protected calculatePrependedBar: CalculationBarType;

  constructor(chart: IChart) {
    this.chart = chart;
  }

  insertBar(bar: IBar) {
    this.processBar(bar);
  }

  processBar(bar: IBar) {
    const lastBar = this.getLastBar();

    if (!lastBar) {
      this.chart.appendBars(bar);

      return;
    }

    const action: BarAction = this._processRealtimeBar(bar);
    if (action === BarAction.Add) {
      this.addBar(bar);
      this.updateLastBar(lastBar);
    } else if (action === BarAction.Update) {
      this.updateLastBar(bar);
    }
  }


  protected abstract _processRealtimeBar(bar: IBar): BarAction;

  protected abstract _calculateBarAction(bar);

  prependBar(bar: IBar) {
    if (!this.lastPrependedBar) {
      this.chart.dataManager.insertBars(0, bar);
      this.lastPrependedBar = this.chart.dataManager.bar(0);
      this.lastPrependedBarIndex = 0;
    } else {
      this._processPrependedBar(bar);
    }
  }

  protected _processPrependedBar(bar) {
    const mappedBar = this.getMappedBar(bar);
    if (this._calculateBarAction(mappedBar) === BarAction.Add) {
      this.lastPrependedBarIndex++;
      this.chart.dataManager.insertBars(this.lastPrependedBarIndex, bar);
      this.lastPrependedBar = this.chart.dataManager.bar(this.lastPrependedBarIndex);
    } else {
      this.lastPrependedBar.volume += bar.volume;
      if (bar.high > this.lastPrependedBar.high)
        this.lastPrependedBar.high = bar.high;
      if (bar.low < this.lastPrependedBar.low)
        this.lastPrependedBar.low = bar.low;
      this.lastPrependedBar.close = bar.close;
      this.lastPrependedBar.ticksCount++;
      this.chart.dataManager.updateBarByIndex(this.lastPrependedBarIndex, this.lastPrependedBar);
    }
  }

  getMappedBar(bar) {
    switch (this.calculatePrependedBar) {
      case CalculationBarType.Bar:
        return bar;
      case CalculationBarType.Last:
        return this.lastPrependedBar;
      case CalculationBarType.Mapped:
        return this._mapPrependedBar(bar);
    }
  }


  clear() {
    this.lastPrependedBar = null;
    this.lastPrependedBarIndex = null;
  }

  getLastBar() {
    return this.chart.dataManager.getLastBar();
  }

  addBar(bar: IBar) {
    this.chart.dataManager.appendBars(bar);

    this.chart.dateScale.applyAutoScroll(BarsUpdateKind.NEW_BAR);
  }

  updateLastBar(bar: IBar) {
    const lastBar = this._mapLastBar(bar);
    this.chart.dataManager.updateLastBar(lastBar);
    this.chart.dateScale.applyAutoScroll(BarsUpdateKind.TICK);
  }

  protected _mapLastBar(bar: IBar) {
    const lastBar = this.chart.dataManager.getLastBar();

    const price = bar.close;
    if (price > lastBar.high)
      lastBar.high = price;
    if (price < lastBar.low)
      lastBar.low = price;
    lastBar.close = price;
    lastBar.volume += bar.volume;

    // TODO investigate should date be updated
    //  lastBar.date = bar.date;

    return lastBar;
  }

  protected _mapPrependedBar(bar: IBar) {
    const mappedBar = { ...bar };
    if (this.lastPrependedBar.high > bar.high) {
      mappedBar.high = this.lastPrependedBar.high;
    }
    if (this.lastPrependedBar.low < bar.low) {
      mappedBar.low = this.lastPrependedBar.low;
    }
    mappedBar.volume += this.lastPrependedBar.volume;
    mappedBar.open = this.lastPrependedBar.open;
    mappedBar.date = this.lastPrependedBar.date;

    return mappedBar;
  }
}

export enum BarAction {
  Add, Update, DoNothing
}
