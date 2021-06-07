import { Periodicity, IInstrument, HistoryRepository, TradeDataFeed, OHLVData, OHLVFeed, OnTradeFn } from 'trading';
import { Inject, Injectable, Injector } from '@angular/core';
import { AccountsManager } from 'accounts-manager';
import { VolumeData, VolumeDataFeed } from 'trading';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';

const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
};

@Injectable()
export class RealOHLVFeed extends OHLVFeed {
  private _executors: OnTradeFn<OHLVData>[] = [];
  private _ohlvData$ = new Subject<OHLVData>();

  constructor(
    protected _injector: Injector,
    private _historyRepository: HistoryRepository,
    private _tradeDatafeed: TradeDataFeed,
    private _volumeDatafeed: VolumeDataFeed,
    @Inject(AccountsManager) protected _accountsManager: AccountsManager,
  ) {
    super();
  }

  // initConnectionDeps() {
  //   super.initConnectionDeps();

  //   this._tradeDatafeed.on(this.handleTrade);
  //   this._volumeDatafeed.on(this.handleVolume);

  //   this._ohlvData$.pipe(
  //     auditTime(500)
  //   ).subscribe(historyItem => {
  //     this._sendToSubscribers(historyItem);
  //   });
  // }

  private _ohlv: {
    [instrumentId: string]: {
      count: number,
      historyItem: OHLVData,
    }
  } = {};


  on(fn: OnTradeFn<OHLVData>) {
    this._executors.push(fn);

    return () => {
      this._executors = this._executors.filter(executor => executor !== fn);
    };
  }


  subscribe(instrument: IInstrument) {
    if (!instrument || !this.connection)
      return;

    if (this._ohlv[instrument.id]?.count) {
      this._ohlv[instrument.symbol].count += 1;
      this._sendToSubscribers(this._ohlv[instrument.symbol].historyItem);
      return;
    }

    const now = new Date();
    const barCount = now.getHours();

    this._historyRepository.getItems({
      id: instrument.id,
      Exchange: instrument.exchange,
      ...historyParams,
      barCount
    }).toPromise().then(res => {
      const data = res.data;
      if (!data || !data.length)
        return;

      const dailyInfo = {
        open: data[0].open,
        low: null,
        high: data[0].high,
        volume: 0,
        close: data[data.length - 1].close
      };

      data.forEach(item => {
        if (dailyInfo.low == null || item.low < dailyInfo.low) {
          dailyInfo.low = item.low;
        }
        if (dailyInfo.high == null || dailyInfo.high < item.high) {
          dailyInfo.high = item.high;
        }
        dailyInfo.volume += item.volume;
      });

      if (!this._ohlv[instrument.symbol]) {
        this._ohlv[instrument.symbol] = { count: 0 } as any;
      }

      const ohlv = this._ohlv[instrument.symbol];
      ohlv.count += 1;
      ohlv.historyItem = dailyInfo as OHLVData;
      ohlv.historyItem.instrument = instrument;
      this._ohlvData$.next(ohlv.historyItem);
    });
  }

  unsubscribe(instrument: IInstrument) {
    if (!this._ohlv[instrument.symbol])
      return;


    if ((this._ohlv[instrument.symbol].count - 1) <= 0) {
      this._tradeDatafeed.unsubscribe(instrument);
      this._volumeDatafeed.unsubscribe(instrument);
    }

    this._ohlv[instrument.symbol].count -= 1;
  }

  handleTrade = (trade) => {
    const ohlvHandler = this._ohlv[trade.instrument.symbol];
    if (!ohlvHandler || !ohlvHandler.count) {
      return;
    }

    const historyItem = this._ohlv[trade.instrument.symbol].historyItem;
    historyItem.close = trade.price;

    if (trade.price < historyItem.low) {
      historyItem.low = trade.price;
    }

    if (trade.price > historyItem.high) {
      historyItem.high = trade.price;
    }
    historyItem.date = new Date(trade.timestamp);
    historyItem.instrument = trade.instrument;
    this._ohlvData$.next(historyItem);
  }

  handleVolume = (data: VolumeData) => {
    const ohlvHandler = this._ohlv[data.instrument.symbol];
    if (!ohlvHandler?.count) {
      return;
    }

    ohlvHandler.historyItem.volume = data.volume;
    const historyItem = ohlvHandler.historyItem;
    historyItem.instrument = data.instrument;
    this._ohlvData$.next(historyItem);
  }

  private _sendToSubscribers(historyItem: OHLVData) {
    this._executors.forEach((fn) => {
      fn(historyItem);
    });
  }
}
