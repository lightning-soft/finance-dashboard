import { Injectable, NgZone } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ITrade, LevelOneDataFeedService, RithmicApiService, WebSocketService } from 'communication';
import { InstrumentsRepository } from 'trading';
import { Datafeed } from './Datafeed';
import { IBarsRequest, IQuote, IRequest } from './models';
import { ITimeFrame, StockChartXPeriodicity } from './TimeFrame';
import { IStockChartXInstrument } from './IInstrument';

declare let StockChartX: any;

@UntilDestroy()
@Injectable()
export class RithmicDatafeed extends Datafeed {

  constructor(
    private _rithmicApiService: RithmicApiService,
    private _instrumentsRepository: InstrumentsRepository,
    private _levelOneDatafeedService: LevelOneDataFeedService,
    private _webSocketService: WebSocketService
  ) {
    super();
  }

  send(request: IBarsRequest) {
    this._rithmicApiService.handleConnection(isConnected => {
      if (isConnected) {
        super.send(request);

        this._webSocketService.setupConnection({ url: 'ws://173.212.193.40:5005/api/market' }, () => {
          this.subscribeToRealtime(request);
        });
        this._loadData(request);

      }
    }, this);
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

      // throw new Error('Invalid instrument!');

      return;
    }

    if (kind === 'moreBars') {
      this.cancel(request);

      return;
    }

    const { symbol, exchange } = instrument;

    const barSize = this._timeFrameToBarSize(timeFrame);

    const params = {
      Exchange: exchange,
      Periodicity: 4,
      BarSize: barSize,
      BarCount: count,
    };

    this._rithmicApiService.getHistory(symbol, params).subscribe(
      (res) => {
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

  subscribeToRealtime(request: IBarsRequest) {
    const chart = request.chart;
    const instrument = this._getInstrument(request);
    this._levelOneDatafeedService.subscribe([instrument]);

    console.log('subscribe');
    this._levelOneDatafeedService.on((trade) => {

      if (Array.isArray(trade)) {
        for (const quote of trade) {
          // this.processQuote(chart, quote);
          console.log(quote);
        }
      } else {
        console.log(trade);
        if (isNaN(trade.Price)) return;
        console.log('------------>');

        const quote: IQuote = {
          price: trade.Price,
          volume: trade.Volume,
          date: new Date(trade.Timestamp),
          instrument: {
            symbol: trade.Instrument.Symbol,
            company: trade.Instrument.Symbol,
            Exchange: trade.Instrument.Exchange,
            tickSize: 0.2,
            id: Date.now,
          }
        } as any;
        this.processQuote(chart, quote);
      }
    });
  }

  private _getInstrument(req: IRequest) {
    return req.instrument ?? req.chart.instrument;
  }
}
