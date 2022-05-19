import { Injectable, Injector } from '@angular/core';
import { concat, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HistoryRepository, IAccount, IInstrument, InstrumentsRepository, TradeDataFeed, TradePrint } from 'trading';
import { Datafeed } from './Datafeed';
import { IBarsRequest, IQuote as ChartQuote, IRequest } from './models';
import { StockChartXPeriodicity, TimeFrame } from './TimeFrame';
import { NotifierService } from 'notifier';

declare let StockChartX: any;

@Injectable()
export class RithmicDatafeed extends Datafeed {
  private _destroy = new Subject();
  lastInterval;

  private _unsubscribeFns: VoidFunction[] = [];
  requestSubscriptions = new Map<number, Subscription>();

  constructor(
    protected _injector: Injector,
    private _instrumentsRepository: InstrumentsRepository,
    private _historyRepository: HistoryRepository,
    private _tradeDataFeed: TradeDataFeed,
    private _notifier: NotifierService,
  ) {
    super();
  }

  send(request: IBarsRequest) {
    // for omit loading
    if (request?.kind === 'moreBars')
      return;

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

  changeAccount(account: IAccount) {
    const _prevAcc = this._account;
    super.changeAccount(account);
    if (_prevAcc?.id != account?.id)
      this.subscribeToRealtime();
  }

  changeInstrument(instrument: IInstrument) {
    const _prevInst = this._instrument;
    super.changeInstrument(instrument);
    if (_prevInst?.id != instrument?.id)
      this.subscribeToRealtime();
  }

  private _loadData(request: IBarsRequest) {
    const { kind, chart } = request;
    const { instrument, timeFrame } = chart;
    let { startDate, endDate } = request;

    if (!instrument) {
      this.cancel(request);
      return;
    }

    if (kind === 'bars') {
      endDate = new Date();
    }

    if (!endDate)
      endDate = new Date();

    if (!startDate)
      startDate = new Date(endDate.getTime() - TimeFrame.timeFrameToTimeInterval(request.chart.periodToLoad));
    startDate.setHours(0, 0, 0, 0);

    this.lastInterval = endDate.getTime() - startDate.getTime();

    if (kind === 'moreBars') {
      startDate = new Date(endDate.getTime() - this.lastInterval);
      this.makeRequest(instrument, request, timeFrame, endDate, startDate);

      return;
    }
    this.endDate = endDate;
    this.makeRequest(instrument, request, timeFrame, endDate, startDate);
  }

  makeRequest(instrument: IInstrument, request, timeFrame, endDate, startDate) {
    const { exchange, symbol, productCode } = instrument;

    const timeZoneOffset = this._getTimeZone();

    const params = {
      productCode,
      Exchange: exchange,
      Symbol: symbol,
      Periodicity: this._convertPeriodicity(timeFrame.periodicity),
      BarSize: timeFrame.interval,
      endDate,
      accountId: this._account?.id,
      startDate,
      timeZoneOffset,
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
          this.onRequestCompleted(request, { bars: res.data, additionalInfo: res.additionalInfo, });
        }
      },
      error: (err) => {
        this._notifier.showError(err);
        console.error(err);
      },
    });
    this.requestSubscriptions.set(request.id, subscription);
  }

  protected onRequestCompleted(request: IBarsRequest, response) {
    if (this._chart == null) {
      this._chart = request.chart;
      this.subscribeToRealtime();
    }
    super.onRequestCompleted(request, response);
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
        return 'Monthly';
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
      case StockChartXPeriodicity.REVS:
        return 'REVS';
      case StockChartXPeriodicity.VOLUME:
        return 'VOLUME';
      case StockChartXPeriodicity.RANGE:
        return 'RANGE';
      case StockChartXPeriodicity.RENKO:
        return 'RENKO';
      case StockChartXPeriodicity.TICK:
        return 'TICK';
      default:
        return 'TICK';
    }
  }

  subscribeToRealtime() {
    const instrument = this._instrument;
    const account = this._account;
    if (!instrument || !account || !this._chart)
      return;

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

        this.processQuote({ chart: this._chart } as any, _quote);
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

  private _getTimeZone(): string {
    const offset: number = new Date().getTimezoneOffset();
    const o: number = Math.abs(offset);

    return (offset < 0 ? '' : '-') + ('00' + Math.floor(o / 60)).slice(-2) + ':' + ('00' + (o % 60)).slice(-2) + ':00';
  }

}
