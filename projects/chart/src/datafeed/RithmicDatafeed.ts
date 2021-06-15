import { Injectable, Injector } from '@angular/core';
import { concat, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HistoryRepository, InstrumentsRepository, TradeDataFeed, TradePrint } from 'trading';
import { IBar } from '../models';
import { Datafeed } from './Datafeed';
import { IBarsRequest, IQuote as ChartQuote, IRequest } from './models';
import { StockChartXPeriodicity } from './TimeFrame';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  private _destroy = new Subject();

  private _unsubscribeFns: VoidFunction[] = [];
  requestSubscriptions = new Map<number, Subscription>();

  constructor(
    protected _injector: Injector,
    private _instrumentsRepository: InstrumentsRepository,
    private _historyRepository: HistoryRepository,
    private _tradeDataFeed: TradeDataFeed,
  ) {
    super();
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
      Symbol: symbol,
      Exchange: exchange,
      Periodicity: this._convertPeriodicity(timeFrame.periodicity),
      BarSize: timeFrame.interval,
      accountId: this._account.id,
      BarCount: count ?? 500,
      Skip: 0,
      PriceHistory: true,
    };

    const history$ = this._historyRepository.getItems(params).pipe(
      tap((res) => {
        if (this.isRequestAlive(request)) {
          this.onRequestCompleted(request, res.data);
          // this._webSocketService.connect(() => this.subscribeToRealtime(request)); // todo: test
        }
      }),
      catchError((err) => {
        this.cancel(request);
        return throwError(err);
      }),
    );

    // const historyDetails$ = this._historyRepository.getItems({ ...params, PriceHistory: true }).pipe(
    //   tap((res) => {
    //     const { chart } = request;
    //     const { dataManager } = chart;
    //     const dates = dataManager.dateDataSeries.values as Date[];
    //     const detailsDataSeries = dataManager.getDataSeries('.details');

    //     res.data.forEach((item: any) => {
    //       const index = dates.findIndex(date => +date === +item.date);

    //       if (index > -1) {
    //         detailsDataSeries.valueAtIndex(index, item.details);
    //       }
    //     });

    //     chart.setNeedsUpdate();
    //   }),
    // );

    const subscription = concat(
      history$,
      // historyDetails$,
    ).subscribe({
      error: (err) => console.error(err),
    });
    this.requestSubscriptions.set(request.id, subscription);
  }

  protected onRequestCompleted(request: IBarsRequest, bars: IBar[]) {
    super.onRequestCompleted(request, bars);
    this.requestSubscriptions.delete(request.id);
  }

  cancel(request: IRequest) {
    super.cancel(request);
    const subscription = this.requestSubscriptions.get(request.id);
    if (subscription && !subscription.closed)
      subscription.unsubscribe();
    this.requestSubscriptions.delete(request.id);
  }

  _convertPeriodicity(periodicity: string): string {

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
    const instrument = this._getInstrument(request);
    const instrumentId = `${instrument.exchange}.${instrument.symbol}`;

    this._unsubscribe();

    this._unsubscribeFns.push(this._tradeDataFeed.on((quote: TradePrint) => {
      const quoteInstrument = quote.instrument;
      const quoteInstrumentId = `${quoteInstrument.exchange}.${quoteInstrument.symbol}`;

      if (instrumentId === quoteInstrumentId) {
        const _quote: ChartQuote = {
          // Ask: quote.volume;
          // AskSize: number;
          // Bid: number;
          // BidSize: number;
          instrument: quoteInstrument,
          price: quote.price,
          date: new Date(quote.timestamp),
          volume: quote.volume,
          side: quote.side,
        } as any;

        this.processQuote(request, _quote);
      }
    }));
  }

  private _getInstrument(req: IRequest) {
    return req.instrument ?? req.chart.instrument;
  }

  _unsubscribe() {
    this._unsubscribeFns.forEach(fn => fn());
    this.requestSubscriptions.forEach(item => {
      if (item && !item.closed)
        item.unsubscribe();
    });
    this._unsubscribeFns = [];
  }

  destroy() {
    super.destroy();
    this._destroy.next();
    this._destroy.complete();
    this._unsubscribe();
  }
}
