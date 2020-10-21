import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import queryString from 'query-string';
import { RITHMIC_API_URL } from 'communication';
import { InstrumentsRepository } from 'trading';
import { Datafeed } from './Datafeed';
import { IBarsRequest } from './models';
import { ITimeFrame, StockChartXPeriodicity } from './TimeFrame';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  private _data: any[] = [];
  private _offset = 0;

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
    const { kind, count, chart } = request;
    const { instrument, timeFrame } = chart;

    if (!instrument) {
      this.cancel(request);

      throw new Error('Invalid instrument!');
    }

    if (kind === 'moreBars') {
      of({}).pipe(delay(1000)).subscribe(
        () => this._handleSuccess(request),
        () => this._handleError(request),
      );

      return;
    }

    const { symbol, exchange } = instrument;

    const barSize = this._timeFrameToBarSize(timeFrame);

    const params = queryString.stringify({
      Exchange: exchange,
      Periodicity: 4,
      BarSize: barSize,
      BarCount: count * 10,
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
      tap((res: any) => this._data = res.data),
    ).subscribe(
      () => this._handleSuccess(request),
      () => this._handleError(request),
    );
  }

  private _handleSuccess(request) {
    if (this.isRequestAlive(request)) {
      const { length } = this._data;
      const offset = length - this._offset - 1;
      const data = this._data.slice(offset - request.count, offset);

      this._offset += request.count;

      this.onRequestCompleted(request, data);
    }
  }

  private _handleError(request) {
    this.cancel(request);
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
