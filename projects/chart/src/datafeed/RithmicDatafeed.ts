import { Injectable } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import {
  HistoryRepository,
  InstrumentsRepository, ITrade,
  LevelOneDataFeed
} from 'trading';
import { Datafeed } from './Datafeed';
import { IBarsRequest, IQuote, IRequest } from './models';
import { StockChartXPeriodicity } from './TimeFrame';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  private _destroy = new Subject();
  constructor(
    private _accountsManager: AccountsManager,
    private _instrumentsRepository: InstrumentsRepository,
    private _historyRepository: HistoryRepository,
    private _levelOneDatafeedService: LevelOneDataFeed,
  ) {
    super();

    this._accountsManager.connections
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();

        this._historyRepository = this._historyRepository.forConnection(connection);
      });
  }

  send(request: IBarsRequest) {
    super.send(request);
    this.subscribeToRealtime(request);
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

      // throw new Error('Invalid instrument!');

      return;
    }

    if (kind === 'moreBars') {
      this.cancel(request);

      return;
    }

    const { symbol, exchange } = instrument;

    const params = {
      Exchange: exchange,
      Periodicity: this._convertPeriodicity(timeFrame.periodicity),
      BarSize: timeFrame.interval,
      BarCount: count,
      Skip: 0,
    };

    this._historyRepository.getItems({ id: symbol, ...params }).subscribe(
      (res) => {
        if (this.isRequestAlive(request)) {
          this.onRequestCompleted(request, res.data);
          // this._webSocketService.connect(() => this.subscribeToRealtime(request)); // todo: test
        }
      },
      () => this.cancel(request),
    );
  }

  private _convertPeriodicity(periodicity: string): string {

    switch (periodicity) {
      case StockChartXPeriodicity.YEAR:
        return 'Yearly';
      case StockChartXPeriodicity.MONTH:
        return 'Mounthly';
      case StockChartXPeriodicity.WEEK:
        return 'Weekly';
      case StockChartXPeriodicity.DAY:
        return 'Daily';
      case StockChartXPeriodicity.HOUR:
        return 'Hourly';
      case StockChartXPeriodicity.MINUTE:
        return 'Minute';
      default:
        throw new Error('Undefined periodicity ' + periodicity);
    }
  }

  subscribeToRealtime(request: IBarsRequest) {
    const chart = request.chart;
    const instrument = this._getInstrument(request);
    this._levelOneDatafeedService.subscribe(instrument);

    this._levelOneDatafeedService.on((trade: ITrade) => {
      if (isNaN(trade.askInfo.price) || isNaN(trade.bidInfo.price)) return;

      const quote: IQuote = {
        askInfo: {
          price: trade.askInfo.price,
          volume: trade.askInfo.volume,
          order: trade.askInfo.orderCount
        },
        bidInfo: {
          price: trade.bidInfo.price,
          volume: trade.bidInfo.volume,
          order: trade.bidInfo.orderCount
        },
        price: (trade.bidInfo.price + trade.askInfo.price) / 2,
        date: new Date(trade.timestamp),
        instrument: {
          symbol: trade.instrument.symbol,
          company: trade.instrument.symbol,
          exchange: trade.instrument.exchange,
          tickSize: 0.2,
          id: Date.now,
        }
      } as any;
      this.processQuote(chart, quote);

    });
  }

  private _getInstrument(req: IRequest) {
    return req.instrument ?? req.chart.instrument;
  }

  destroy() {
    super.destroy();
    this._destroy.next();
    this._destroy.complete();
  }
}
