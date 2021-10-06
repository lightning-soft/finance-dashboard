import { Injectable, Injector } from '@angular/core';
import { concat, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HistoryRepository, IInstrument, InstrumentsRepository, TradeDataFeed, TradePrint } from 'trading';
import { IBar } from '../models';
import { Datafeed } from './Datafeed';
import { IBarsRequest, IQuote as ChartQuote, IRequest } from './models';
import { ITimeFrame, StockChartXPeriodicity, TimeFrame } from './TimeFrame';

const defaultTimePeriod = { interval: 3, periodicity: StockChartXPeriodicity.DAY };
declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  private _destroy = new Subject();
  lastInterval;

  private _unsubscribeFns: VoidFunction[] = [];
  requestSubscriptions = new Map<number, Subscription>();
  private _isMoreBarsActive = false;

  constructor(
    protected _injector: Injector,
    private _instrumentsRepository: InstrumentsRepository,
    private _historyRepository: HistoryRepository,
    private _tradeDataFeed: TradeDataFeed,
  ) {
    super();
  }

  send(request: IBarsRequest) {
    // for omit loading
    if (request?.kind === 'moreBars')
      return;

    super.send(request);
    if (request.kind === 'bars')
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
    const { kind, chart } = request;
    const { instrument, timeFrame } = chart;
    let { startDate, endDate } = request;

    if (!instrument) {
      this.cancel(request);
      return;
    }

    if (!endDate)
      endDate = new Date();

    if (!startDate)
      startDate = new Date(endDate.getTime() - TimeFrame.timeFrameToTimeInterval(defaultTimePeriod));

    if (kind === 'bars')
      this.lastInterval = endDate.getTime() - startDate.getTime();

    if (kind === 'moreBars') {
      this._isMoreBarsActive = true;
      startDate = new Date(endDate.getTime() - this.lastInterval);
      this.makeRequest(instrument, request, timeFrame, endDate, startDate);

      return;
    }

    this._isMoreBarsActive = false;
    this.makeRequest(instrument, request, timeFrame, endDate, startDate);
  }

  makeRequest(instrument: IInstrument, request, timeFrame, endDate, startDate) {
    const { exchange, productCode } = instrument;

    const params = {
      productCode,
      Exchange: exchange,
      Periodicity: this._convertPeriodicity(timeFrame.periodicity),
      BarSize: this._convertInterval(timeFrame),
      endDate,
      accountId: this._account?.id,
      startDate,
      PriceHistory: true,
    };

    const history$ = this._historyRepository.getItems(params).pipe(
      catchError((err) => {
        this.cancel(request);
        return throwError(err);
      }),
    );

    const subscription = concat(
      history$,
    ).subscribe({
      next: (res) => {
        if (this.isRequestAlive(request)) {
          this.onRequestCompleted(request, res.data);
        }
      },
      error: (err) => console.error(err),
    });
    this.requestSubscriptions.set(request.id, subscription);
  }

  protected onRequestCompleted(request: IBarsRequest, bars: IBar[]) {
    super.onRequestCompleted(request, bars);
    this.requestSubscriptions.delete(request.id);
    this._isMoreBarsActive = false;
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
      case StockChartXPeriodicity.SECOND:
        return 'Second';
      case StockChartXPeriodicity.TICK:
        return 'TICK';
      case StockChartXPeriodicity.REVS:
        return 'TICK';
      default:
        return 'Second';
    }
  }

  _convertInterval(frame: ITimeFrame): number {
    if (customTimeFrames.includes(frame.periodicity)) {
      return 1;
    }
    return frame.interval;
  }

  subscribeToRealtime(request: IBarsRequest) {
    const instrument = this._getInstrument(request);

    this._unsubscribe();
    const connId = this._account?.connectionId;
    if (connId == null)
      return;


    this._tradeDataFeed.subscribe(instrument, connId);

    this._unsubscribeFns.push(() => this._tradeDataFeed.unsubscribe(instrument, connId));
    this._unsubscribeFns.push(this._tradeDataFeed.on((quote: TradePrint, connectionId) => {
      if (connectionId !== connId)
        return;

      const quoteInstrument = quote.instrument;

      if (instrument.id === quoteInstrument.id) {
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

const customTimeFrames = [StockChartXPeriodicity.RANGE, StockChartXPeriodicity.RENKO,
StockChartXPeriodicity.VOLUME, StockChartXPeriodicity.TICK, StockChartXPeriodicity.REVS];
