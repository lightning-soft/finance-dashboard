import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import queryString from 'query-string';
import { RITHMIC_API_URL } from 'communication';
import { InstrumentsRepository } from 'trading';
import { Datafeed } from './Datafeed';
import { IBarsRequest } from './models';
import { ITimeFrame, StockChartXPeriodicity } from './TimeFrame';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  constructor(
    private _httpClient: HttpClient,
    private _instrumentsRepository: InstrumentsRepository,
  ) {
    super();
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
      this.cancel(request);

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
        const data = res.result.map(item => ({
          date: moment.utc(item.timestamp).toDate(),
          open: item.openPrice,
          close: item.closePrice,
          high: item.highPrice,
          low: item.lowPrice,
          volume: item.volume,
        }));

        return { data };
      }),
    ).subscribe(
      (res: any) => {
        if (this.isRequestAlive(request)) {
          this.onRequestCompleted(request, res.data);
        }
      },
      () => this.cancel(request),
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
}
