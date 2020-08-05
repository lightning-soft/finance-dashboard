import {BarsUpdateKind, IBarsRequest, IQuate, IRequest, IStockChartXBar, RequestKind} from './models';
import {Injectable} from '@angular/core';
import {IBar, IChart} from '../models/chart';
import { IStockChartXInstrument } from './IInstrument';
export type IDateFormat = (request: IRequest) => string;

export interface IKeyValuePair<TKey, TValue> {
  key: TKey;
  value: TValue;
}

export interface IDictionary<TKey, TValue> {
  count: number;

  set(key: TKey, value: TValue): void;

  remove(key: TKey): boolean;

  containsKey(key: TKey): boolean;

  get(key: TKey): TValue;
}


export class Dictionary<TKey extends string | number, TValue> implements IDictionary<TKey, TValue> {
  /**
   * @internal
   */
  private _dict: object;

  // region Properties

  /**
   * @internal
   */
  private _length: number;

  get count(): number {
    return this._length;
  }

  // endregion

  constructor(pairs?: IKeyValuePair<TKey, TValue> | IKeyValuePair<TKey, TValue>[]) {
    this._length = 0;
    this._dict = {};

    if (pairs) {
      if (Array.isArray(pairs)) {
        for (let pair of pairs) {
          this.set(pair.key, pair.value);
        }
      } else {
        this.set(pairs.key, pairs.value);
      }
    }
  }

  /**
   * Adds new key/value pair into the dictionary.
   * @method add
   * @param {string} key The key
   * @param {*} value The value
   * @memberOf StockChartX.Dictionary#
   */
  set(key: TKey, value: TValue) {
    this._dict[<any> key] = value;
    this._length++;
  }

  /**
   * Removes key/value pair by a given key.
   * @method remove
   * @param {string} key The key to be removed.
   * @returns {boolean} True if pair has been removed, false if key is present in the dictionary.
   * @memberOf StockChartX.Dictionary#
   */
  remove(key: TKey): boolean {
    if (!this.containsKey(key))
      return false;

    delete this._dict[<any> key];
    this._length--;

    return true;
  }

  /**
   * Removes all keys and values from the dictionary.
   * @method clear
   * @memberOf StockChartX.Dictionary#
   */
  clear(): void {
    this._length = 0;
    this._dict = {};
  }

  /**
   * Checks whether given key is present in the dictionary.
   * @method containsKey
   * @param {string} key The key.
   * @returns {boolean} True if key is present in the dictionary, false otherwise.
   * @memberOf StockChartX.Dictionary#
   */
  containsKey(key: TKey): boolean {
    return this._dict[<any> key] !== undefined;
  }

  /**
   * Returns value by a given key.
   * @method get
   * @param {string} key The key.
   * @returns {*} Value by by a given key.
   * @memberOf StockChartX.Dictionary#
   */
  get(key: TKey): TValue {
    return this.containsKey(key) ? this._dict[<any> key] : null;
  }

  values(): TValue[] {
    let arr = [];

    for (let key in this.keys()) {
      arr.push(this.get(key as TKey));
    }

    return arr;
  }

  keys(): TKey[] {
    return Object.keys(this._dict) as TKey[];
  }
}

export interface IDatafeed {
  send(request: IRequest);

  cancel(request: IRequest);
}

declare let StockChartX: any;



@Injectable()
export abstract class Datafeed implements IDatafeed {

  /**
   * @internal
   */
  private static _requestId = 0;

  protected _chart: IChart;

  set chart(chart: IChart){
    this._chart = chart;
  }


  /**
   * Generates next unique request identifier.
   * @method nextRequestId
   * @returns {number}
   * @memberOf StockChartX.Datafeed#
   */
  static nextRequestId(): number {
    return ++this._requestId;
  }

  /**
   * @internal
   */
  private _requests = new Dictionary<number, IRequest>();

  /**
   * Executes request post cancel actions (e.g. hides waiting bar).
   * @method onRequstCanceled
   * @memberOf StockChartX.Datafeed#
   * @protected
   */

  protected onRequstCanceled(request: IBarsRequest) {
    request.chart.hideWaitingBar();
  }

  protected processQuate(chart: IChart, quote: IQuate): void {

    if (quote.symbol.symbol !== chart.instrument.symbol)
      return;

    let lastBar = this._getLastBar(chart),
      currentBarStartTimestamp,
      nextBarStartTimestamp;
    if (lastBar) {
      currentBarStartTimestamp = lastBar.date.getTime();
      nextBarStartTimestamp = <number> currentBarStartTimestamp + <number> chart.timeInterval;
    } else {
      return;
    }

    if (quote.date.getTime() < currentBarStartTimestamp || quote.price === 0)
      return;

    if (new Date(quote.date) >= new Date(nextBarStartTimestamp) || lastBar === null) {
      // If there were no historical data and timestamp is in range of current time frame
      if (lastBar === null && quote.date < nextBarStartTimestamp)
        nextBarStartTimestamp = currentBarStartTimestamp;

      // If gap is more than one time frame
      while (quote.date.getTime() >= <number> nextBarStartTimestamp + <number> chart.timeInterval)
        nextBarStartTimestamp += chart.timeInterval;

      // Create bar
      const bar = {
        open: quote.price,
        high: quote.price,
        low: quote.price,
        close: quote.price,
        volume: quote.volume,
        date: new Date(nextBarStartTimestamp)
      };

      chart.appendBars(bar);
      chart.dateScale.applyAutoScroll(BarsUpdateKind.NEW_BAR);
    } else {
      // Update current bar
      lastBar.close = quote.price;
      // Temporary workaround
      lastBar.volume = (<number> lastBar.volume) + quote.volume / 1000;

      if (lastBar.high < quote.price)
        lastBar.high = quote.price;

      if (lastBar.low > quote.price)
        lastBar.low = quote.price;

      this._updateLastBar(lastBar, chart);
      chart.dateScale.applyAutoScroll(BarsUpdateKind.TICK);
    }
  }

  protected processMainQuate(chart: IChart, quate: any) {
    const newQuate = this.convertQuate(quate);
    this.processQuate(chart, newQuate);
  }
   abstract subscribeToRealtime();

  private _updateLastBar(bar: IBar, chart: IChart, instrument?: IStockChartXInstrument): void {
    const symbol = instrument && instrument.symbol !== chart.instrument.symbol ? instrument.symbol : '',
      barDataSeries = chart.dataManager.barDataSeries(symbol);

    barDataSeries.open.updateLast(bar.open);
    barDataSeries.high.updateLast(bar.high);
    barDataSeries.low.updateLast(bar.low);
    barDataSeries.close.updateLast(bar.close);
    barDataSeries.volume.updateLast(bar.volume);
    barDataSeries.date.updateLast(bar.date);

    chart.setNeedsUpdate(true);
  }

  protected _getLastBar(chart: IChart, instrument?: IStockChartXInstrument): IBar {
    const symbol = instrument && instrument.symbol || '',
      barDataSeries = chart.dataManager.barDataSeries(symbol, true);

    if (barDataSeries.date.values.length === 0)
      return null;

    return {
      open: barDataSeries.open.lastValue as number,
      high: <number> barDataSeries.high.lastValue,
      low: <number> barDataSeries.low.lastValue,
      close: <number> barDataSeries.close.lastValue,
      volume: <number> barDataSeries.volume.lastValue,
      date: <Date> barDataSeries.date.lastValue
    };
  }
  /**
   * Executes request post complete actions (e.g. hides waiting bar, updates indicators, refreshes chart).
   * @method onRequestCompleted
   * @memberOf StockChartX.Datafeed#
   * @protected
   */
  protected onRequestCompleted(request: IBarsRequest, bars: IStockChartXBar[]) {
    let chart = request.chart,
      dataManager = chart.dataManager,
      oldFirstVisibleRecord = chart.firstVisibleRecord,
      oldLastVisibleRecord = chart.lastVisibleRecord;

    if (bars) {
      switch (request.kind) {
        case RequestKind.BARS:
          dataManager.clearDataSeries();
          dataManager.appendBars(bars);
          break;
        case RequestKind.MORE_BARS:
          if (bars.length) {
            if (request.fromDate != null) {
              const barDataSeries = dataManager.barDataSeries(),
                minDateBar = bars.sort((b1, b2) => b1.date.getTime() - b2.date.getTime())[0],
                oldBars = [];

              for (let i = 0; i < barDataSeries.date.length; i++) {
                if (barDataSeries.date.value(i) >= minDateBar.date)
                  continue;

                oldBars.push({
                  date: barDataSeries.date.value(i),
                  open: barDataSeries.open.value(i),
                  high: barDataSeries.high.value(i),
                  low: barDataSeries.low.value(i),
                  close: barDataSeries.close.value(i),
                  volume: barDataSeries.volume.value(i),
                });
              }

              oldBars.push(...bars);
              dataManager.clearDataSeries();
              dataManager.appendBars(oldBars);
            } else
              dataManager.insertBars(0, bars);
          }
          break;
        default:
          throw new Error(`Unknown request kind: ${request.kind}`);
      }
      chart.updateComputedDataSeries();

      if (request.kind === RequestKind.BARS) {
        if (!StockChartX.Environment.isMobile)
          if (chart.recordRange)
            chart.recordRange(20);
      } else if (request.kind === RequestKind.MORE_BARS) {
        if (oldFirstVisibleRecord)
          chart.firstVisibleRecord = oldFirstVisibleRecord + bars.length;

        if (oldLastVisibleRecord)
          chart.lastVisibleRecord = oldLastVisibleRecord + bars.length;
      }
    }
    this._requests.remove(request.id);

    chart.hideWaitingBar();
    chart.updateIndicators();
    chart.setNeedsAutoScale();
    chart.setNeedsUpdate(true);
    chart.dateScale.onMoreHistoryRequestCompleted();
  }



  // region IDatafeed members

  /**
   * Sends request to the datafeed provider.
   * @method send
   * @param {StockChartX~Request} request The processing request.
   * @memberOf StockChartX.Datafeed#
   */
  send(request: IRequest) {
    request.id = Datafeed.nextRequestId(); // fixed error: from two chart the same id
    this._requests.set(request.id, request);

    request.chart.showWaitingBar();
  }

  /**
   * Cancels request processing.
   * @method cancel
   * @param {StockChartX~Request} request The cancelling request.
   * @memberOf StockChartX.Datafeed#
   */
  cancel(request: IRequest) {
    this._requests.remove(request.id);
  }

  /**
   * Destroy request.
   * @method destroy
   * @param {StockChartX~Request}.
   * @memberOf StockChartX.Datafeed#
   */
  destroy() {
    this._requests.clear();
  }

  // endregion

  /**
   * Determines whether request is alive.
   * @method isRequestAlive
   * @param {StockChartX~Request} request The request.
   * @memberof StockChartX.Datafeed#
   * @returns {boolean} True if request is alive, otherwise false.
   */
  isRequestAlive(request: IRequest): boolean {
    return this._requests.containsKey(request.id);
  }

  protected  abstract convertQuate(quate: any): IQuate;
}
