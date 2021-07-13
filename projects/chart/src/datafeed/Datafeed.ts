import { Injectable } from '@angular/core';
import { IAccount, OrderSide } from 'trading';
import { IBar, IChart, IDetails } from '../models';
import { BarsUpdateKind, IBarsRequest, IQuote, IRequest, IStockChartXInstrument, RequestKind } from './models';

export type IDateFormat = (request: IRequest) => string;

export interface IKeyValuePair<TKey, TValue> {
  key: TKey;
  value: TValue;
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

  /**
   * @internal
   */
  private _requests = new Map<number, IRequest>();

  /**
   * @internal
   */
  protected _details: IDetails[] = [];

  /**
   * @internal
   */
  protected _account: IAccount;

  /**
   * Executes request post cancel actions (e.g. hides waiting bar).
   * @method onRequstCanceled
   * @memberOf StockChartX.Datafeed#
   * @protected
   */
  protected onRequstCanceled(request: IBarsRequest) {
    this._details = [];

    if (this._requests.size === 0)
      request.chart.hideWaitingBar();
  }

  /**
   * Executes request post complete actions (e.g. hides waiting bar, updates indicators, refreshes chart).
   * @method onRequestCompleted
   * @memberOf StockChartX.Datafeed#
   * @protected
   */
  protected onRequestCompleted(request: IBarsRequest, bars: IBar[]) {
    let chart = request.chart,
      dataManager = chart.dataManager,
      oldFirstVisibleRecord = chart.firstVisibleRecord,
      oldLastVisibleRecord = chart.lastVisibleRecord,
      oldPrimaryBarsCount = request.kind === RequestKind.MORE_BARS ? chart.primaryBarDataSeries().low.length : 0,
      instrument = request.instrument;

    switch (request.kind) {
      case RequestKind.BARS:
        dataManager.clearBarDataSeries(instrument);
        dataManager.appendInstrumentBars(instrument, bars);
        break;
      case RequestKind.MORE_BARS:
        dataManager.insertInstrumentBars(instrument, 0, bars);
        break;
      default:
        throw new Error(`Unknown request kind: ${ request.kind }`);
    }
    chart.updateComputedDataSeries();

    let barsCount = chart.primaryBarDataSeries().low.length - oldPrimaryBarsCount;
    if (instrument) {
      barsCount = Math.round(chart.lastVisibleIndex - chart.firstVisibleIndex);
    }

    // if !instrument then load bars for chart, not for compare
    if (!instrument) {
      if (request.kind === RequestKind.BARS) {
        chart.recordRange(barsCount > 0 && barsCount < 100 ? barsCount : 100);
      } else if (request.kind === RequestKind.MORE_BARS) {
        chart.firstVisibleRecord = barsCount < 0 ? 0 : oldFirstVisibleRecord + barsCount;
        chart.lastVisibleRecord = oldLastVisibleRecord + Math.abs(barsCount);
      }
    }

    chart.fireValueChanged(StockChartX.ChartEvent.HISTORY_LOADED, { request, bars });

    this._requests.delete(request.id);

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
    this._requests.delete(request.id);
    this.onRequstCanceled(request as IBarsRequest);
  }

  changeAccount(account: IAccount) {
    this._account = account;
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
    return this._requests.has(request.id);
  }


  protected processQuote(request: IRequest, quote: IQuote): void {
    if (quote?.instrument?.symbol == null)
      return;

    if (this.isRequestAlive(request)) {
      this._details = this._mergeRealtimeDetails(quote, this._details);
      return;
    }

    const { chart } = request;

    // if instrument is null then you operate with main bars otherwise with others bars datasiries(compare instruments)
    const instrument = chart.instrument.symbol == quote.instrument.symbol ? null : quote.instrument;
    let lastBar = this._getLastBar(chart, instrument);

    if (!lastBar)
      return;

    if (this._details.length) {
      this._mergeDetails(chart, instrument);

      this._details = [];
    }

    let currentBarStartTimestamp = lastBar.date.getTime();
    let nextBarStartTimestamp = <number>currentBarStartTimestamp + <number>chart.timeInterval;
    const nextBarStartDate = new Date(nextBarStartTimestamp);
    if (quote.date.getTime() < currentBarStartTimestamp || quote.price === 0)
      return;

    if (new Date(quote.date) >= nextBarStartDate || lastBar === null) {
      // If there were no historical data and timestamp is in range of current time frame
      if (lastBar === null && quote.date < nextBarStartDate)
        nextBarStartTimestamp = currentBarStartTimestamp;

      // If gap is more than one time frame
      while (quote.date.getTime() >= <number>nextBarStartTimestamp + <number>chart.timeInterval)
        nextBarStartTimestamp += chart.timeInterval;

      // Create bar
      const bar = {
        open: quote.price,
        high: quote.price,
        low: quote.price,
        close: quote.price,
        volume: quote.volume,
        date: new Date(nextBarStartTimestamp),
        details: this._mergeRealtimeDetails(quote),
      };

      if (!instrument)
        chart.appendBars(bar);
      else
        chart.dataManager.appendInstrumentBars(instrument, bar);

      chart.dateScale.applyAutoScroll(BarsUpdateKind.NEW_BAR);
    } else {
      lastBar.close = quote.price;
      lastBar.volume += quote.volume;

      if (lastBar.high < quote.price)
        lastBar.high = quote.price;

      if (lastBar.low > quote.price)
        lastBar.low = quote.price;

      this._updateLastBarDetails(quote, chart, instrument);
      this._updateLastBar(lastBar, chart, instrument);

      chart.dateScale.applyAutoScroll(BarsUpdateKind.TICK);
    }

    chart.updateIndicators();
  }

  private _updateLastBar(bar: IBar, chart: IChart, instrument?: IStockChartXInstrument): void {
    const symbol = instrument && instrument.symbol !== chart.instrument.symbol ? instrument.symbol : '',
      barDataSeries = chart.dataManager.barDataSeries(symbol);

    barDataSeries.open.updateLast(bar.open);
    barDataSeries.high.updateLast(bar.high);
    barDataSeries.low.updateLast(bar.low);
    barDataSeries.close.updateLast(bar.close);
    barDataSeries.volume.updateLast(bar.volume);
    barDataSeries.date.updateLast(bar.date);

    chart.setNeedsUpdate();
  }

  private _updateLastBarDetails(quote: IQuote, chart: IChart, instrument?: IStockChartXInstrument) {
    const symbol = instrument && instrument.symbol !== chart.instrument.symbol ? instrument.symbol : '';
    const barDataSeries = chart.dataManager.barDataSeries(symbol);
    const detailsDataSeries = barDataSeries.details;
    const lastDetails = detailsDataSeries.lastValue as IDetails[];
    const details = this._mergeRealtimeDetails(quote, lastDetails);

    detailsDataSeries.updateLast(details);
  }

  private _mergeRealtimeDetails(quote: IQuote, details: IDetails[] = null): IDetails[] {
    const { volume, tradesCount: _tradesCount, price } = quote;
    const tradesCount = _tradesCount ?? volume;

    const tmpItem: IDetails = {
      bidInfo: {
        volume: 0,
        tradesCount: 0
      },
      askInfo: {
        volume: 0,
        tradesCount: 0
      },
      volume,
      tradesCount,
      price
    };

    switch (quote.side) {
      case OrderSide.Sell:
        tmpItem.bidInfo.volume = volume;
        tmpItem.bidInfo.tradesCount = tradesCount;
        break;
      case OrderSide.Buy:
        tmpItem.askInfo.volume = volume;
        tmpItem.askInfo.tradesCount = tradesCount;
        break;
    }

    if (!Array.isArray(details) || !details.length) {
      return [tmpItem];
    }

    const item = details.find(i => i.price === price);

    if (!item) {
      details.push(tmpItem);

      return details;
    }

    switch (quote.side) {
      case OrderSide.Sell:
        item.bidInfo.volume += volume;
        item.bidInfo.tradesCount += tradesCount;
        break;
      case OrderSide.Buy:
        item.askInfo.volume += volume;
        item.askInfo.tradesCount += tradesCount;
        break;
    }

    item.volume += volume;
    item.tradesCount += tradesCount;

    return details;
  }

  private _mergeDetails(chart: IChart, instrument?: IStockChartXInstrument) {
    const symbol = instrument && instrument.symbol !== chart.instrument.symbol ? instrument.symbol : '';
    const barDataSeries = chart.dataManager.barDataSeries(symbol);
    const detailsDataSeries = barDataSeries.details;
    const lastDetails = detailsDataSeries.lastValue as IDetails[];

    this._details.forEach(tmpItem => {
      const item = lastDetails.find(i => i.price === tmpItem.price);

      if (item) {
        item.bidInfo.volume += tmpItem.bidInfo.volume;
        item.bidInfo.tradesCount += tmpItem.bidInfo.tradesCount;
        item.askInfo.volume += tmpItem.askInfo.volume;
        item.askInfo.tradesCount += tmpItem.askInfo.tradesCount;
        item.volume += tmpItem.volume;
        item.tradesCount += tmpItem.tradesCount;
      }
    });

    detailsDataSeries?.updateLast(lastDetails);
  }

  protected _getLastBar(chart: IChart, instrument?: IStockChartXInstrument): IBar {
    const symbol = instrument && instrument.symbol || '',
      barDataSeries = chart.dataManager.barDataSeries(symbol, true);

    if (barDataSeries.date.values.length === 0)
      return null;

    return {
      open: barDataSeries.open.lastValue as number,
      high: <number>barDataSeries.high.lastValue,
      low: <number>barDataSeries.low.lastValue,
      close: <number>barDataSeries.close.lastValue,
      volume: <number>barDataSeries.volume.lastValue,
      date: <Date>barDataSeries.date.lastValue
    };
  }
}
