import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import queryString from 'query-string';
import { RITHMIC_API_URL } from 'communication';
import { InstrumentsRepository } from 'trading';
import { Datafeed, IDateFormat } from './Datafeed';
import { IBarsRequest, IQuote, IRequest } from './models';
import { ITimeFrame, StockChartXPeriodicity } from './TimeFrame';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  realtimeSubscription: { [key: string]: Subscription } = {};

  constructor(
    private _httpClient: HttpClient,
    private _instrumentsRepository: InstrumentsRepository,
    private _ngZone: NgZone,
  ) {
    super();
  }

  protected _dateFormat: IDateFormat = () => {
    return 'D-MMM-YY';
  }

  send(request: IBarsRequest) {
    super.send(request);

    this._loadData(request);
  }

  loadInstruments(): Observable<any[]> {
    return this._instrumentsRepository.getItems().pipe(
      tap(instruments => {
        StockChartX.getAllInstruments = () => instruments.data;
      }),
      map(i => i.data),
    );
  }

  private _loadData(request: IBarsRequest) {
    const { instrument, timeFrame } = request.chart;

    if (!instrument) {
      throw new Error('Invalid instrument!');
    }

    const { symbol, exchange } = instrument;

    const barSize = this._timeFrameToBarSize(timeFrame);

    const params = queryString.stringify({
      Exchange: exchange,
      Periodicity: 4,
      BarSize: barSize,
      BarCount: 1000,
    });

    this._httpClient.get(`${RITHMIC_API_URL}History/${symbol}?${params}`).pipe(
      map((res: any) => {
        const locale = moment.locale();

        moment.locale('en');

        const data = res.result.map(item => ({
          date: moment(item.timestamp, this._dateFormat(request)).toDate(),
          open: item.openPrice,
          close: item.closePrice,
          high: item.highPrice,
          low: item.lowPrice,
          volume: item.volume,
        }));

        moment.locale(locale);

        return { data };
      }),
    ).subscribe(
      (res: any) => {
        if (this.isRequestAlive(request)) {
          this.onRequestCompleted(request, res.data);
          this.subscribeToRealtime(request);
        }
      },
      () => this.onRequstCanceled(request),
    );
  }

  private _timeFrameToBarSize(timeFrame: ITimeFrame): number {
    const { interval: i, periodicity } = timeFrame;

    switch (periodicity) {
      case StockChartXPeriodicity.YEAR:
        return i * 365;
      case StockChartXPeriodicity.MONTH:
        return i * 30;
      case StockChartXPeriodicity.WEEK:
        return i * 7;
      case StockChartXPeriodicity.DAY:
        return i;
      case StockChartXPeriodicity.HOUR:
        return i / 24;
      case StockChartXPeriodicity.MINUTE:
        return i / 24 / 60;
      default:
        return 1;
    }
  }

  destroy() {
    super.destroy();
    for (const key in this.realtimeSubscription)
      this.realtimeSubscription[key].unsubscribe();
  }

  subscribeToRealtime(request: IBarsRequest) {
    const chart = request.chart;
    const instrument = getInstrument(request);
    this._ngZone.runOutsideAngular(() => {
      this.realtimeSubscription[instrument.symbol] = interval(300).subscribe(() => {
        // setInterval(() => {
        this._ngZone.runOutsideAngular(() => {
          const lastBar = this._getLastBar(chart, chart?.instrument?.symbol == instrument?.symbol ? null : instrument);
          if (!lastBar)
            return;
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
      });
      // }, 500);
    });
  }
}


function getInstrument(req: IRequest) {
  return req.instrument ?? req.chart.instrument;
}
