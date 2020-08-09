import { Injectable } from '@angular/core';
import { InstrumentsRepository } from 'communication';
import { interval, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Datafeed, IDateFormat } from './Datafeed';
import { IBarsRequest, IQuote, IRequest } from './models';

declare let StockChartX: any;

@Injectable()
export class CSVDatafeed extends Datafeed {
  realtimeSubscription: { [key: string]: Subscription } = {};

  /**
   * @internal
   */
  private _urlBuilder: IDatafeedUrlBuilderCallback;

  /**
   * @internal
   */

  defaultDateFormat = () => {
    return 'D-MMM-YY';
  }

  protected _dateFormat: IDateFormat;

  /**
   * Data separator.
   * @name separator
   * @type {string}
   * @memberOf StockChartX.CsvDatafeed#
   */
  public separator: string;


  constructor(private _instrumentsRepository: InstrumentsRepository) {
    super();
    this._dateFormat = this.defaultDateFormat;
    this.separator = ',';
    this._urlBuilder = this.defaultUrlBuilder;
  }

  set config(config: ICsvDatafeedConfig) {
    this._dateFormat = config.dateFormat;
    this._urlBuilder = config.urlBuilder;
    this.separator = config.separator;

  }

  /**
   * @inheritDoc
   */
  defaultUrlBuilder = (req: IRequest) => {
    const instrument = getInstrument(req);
    if (instrument) {
      switch (instrument.symbol) {
        case 'AAPL':
          return 'assets/StockChartX/data/aapl.csv';
        case 'MSFT':
          return 'assets/StockChartX/data/msft.csv';
        case 'GOOG':
          return 'assets/StockChartX/data/goog.csv';
        default:
          // throw new Error('Please load bars for you instrument');
          return 'assets/StockChartX/data/aapl.csv';

      }
    } else {
      return 'assets/StockChartX/data/aapl.csv';
    }
  }

  send(request: IBarsRequest) {
    super.send(request);

    this._loadData(request);
  }

  loadInstruments(): Observable<any[]> {
    return this._instrumentsRepository.getItems().pipe(
      tap(instruments => {
        StockChartX.UI.Notification.error('Load symbols failed.');
        StockChartX.getAllInstruments = () => instruments;
      })
    )
  }


  /**
   * @internal
   */
  private _buildUrl(request: IRequest): string {
    if (!this._urlBuilder) {
      throw new Error('Url builder is not provided.');
    }

    return this._urlBuilder(request);
  }

  /**
   * @internal
   */
  private _loadData(request: IBarsRequest) {
    const url = this._buildUrl(request);

    $.get(url, (data: any) => {
      if (this.isRequestAlive(request)) {
        this._processResult(data, request);
        this.subscribeToRealtime(request);
      }
    }).fail(() => {
      this.onRequstCanceled(request);
      // UI.Notification.error('Unable to load data file.');
    });
  }

  /**
   * @internal
   */
  private _processResult(data: string, request: IBarsRequest) {
    const bars = this._parseBars(data, request);

    this.onRequestCompleted(request, bars);
  }

  /**
   * @internal
   */
  private _parseBars(data: string, request: IBarsRequest) {
    const bars = [],
      lines = data.split('\n'),
      format = this._dateFormat(request),
      defaultLocale = 'en',
      prevLocale = moment.locale();

    moment.locale(defaultLocale);

    for (const line of lines) {
      const values = line.split(this.separator),
        date = moment(values[0], format).toDate();

      if (request.endDate && date >= request.endDate) {
        break;
      }

      const bar = {
        date,
        open: parseFloat(values[1]),
        high: parseFloat(values[2]),
        low: parseFloat(values[3]),
        close: parseFloat(values[4]),
        volume: parseInt(values[5], 10)
      };
      bars.push(bar);
    }
    if (bars.length > 1) {
      const isDescendingOrder = bars[0].date.getTime() > bars[1].date.getTime();
      if (isDescendingOrder) {
        bars.reverse();
      }
    }
    moment.locale(prevLocale);

    return bars;
  }

  destroy() {
    super.destroy();
    for (const key in this.realtimeSubscription)
      this.realtimeSubscription[key].unsubscribe();
  }

  subscribeToRealtime(request: IBarsRequest) {
    const chart = request.chart;
    const instrument = getInstrument(request);
    this.realtimeSubscription[instrument.symbol] = interval(100).subscribe(() => {
      const lastBar = this._getLastBar(chart, chart?.instrument?.symbol == instrument?.symbol ? null : instrument);
      const price = lastBar.close + ((Math.random() * lastBar.close) / 10000 * ((Math.random() * 100) > 50 ? 1 : -1));
      const volume = lastBar.volume + ((Math.random() * lastBar.volume) / 10000 * ((Math.random() * 100) > 50 ? 1 : -1));

      const newQuate = {
        date: new Date(),
        instrument,
        volume,
        price,
      } as IQuote;

      this.processQuote(chart, newQuate);
    });
  }
}


function getInstrument(req: IRequest) {
  return req.instrument ?? req.chart.instrument;
}
// }

// region Interfaces

export type IDatafeedUrlBuilderCallback = (request: IRequest) => string;

//
export interface ICsvDatafeedConfig {
  urlBuilder?: IDatafeedUrlBuilderCallback;
  dateFormat?: IDateFormat;
  separator?: string;
}

// endregion
