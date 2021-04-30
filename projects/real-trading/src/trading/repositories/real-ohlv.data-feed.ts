import { Periodicity, IInstrument, HistoryRepository, TradeDataFeed, OHLVData, OHLVFeed, OnTradeFn } from 'trading';
import { Inject, Injectable } from '@angular/core';
import { AccountsManager } from 'accounts-manager';

const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
};

@Injectable()
export class RealOHLVFeed extends OHLVFeed {
  private _executors: OnTradeFn<OHLVData>[] = [];

  constructor(
    private _historyRepository: HistoryRepository,
    private _tradeDatafeed: TradeDataFeed,
    @Inject(AccountsManager) protected _accountsManager: AccountsManager,
  ) {
    super();
    this._tradeDatafeed.on(this.handleTrade);
  }

  private _ohlv: {
    [instrumentId: string]: {
      count: number,
      historyItem: OHLVData
    }
  } = {};


  on(fn: OnTradeFn<OHLVData>) {
    this._executors.push(fn);

    return () => {
      this._executors = this._executors.filter(executor => executor !== fn);
    };
  }


  subscribe(instrument: IInstrument) {
    const connection = this._accountsManager.getActiveConnection();
    if (!instrument || !connection)
      return;

    if (this._ohlv[instrument.id]?.count) {
      this._ohlv[instrument.symbol].count += 1;
      this._sendToSubscribers(this._ohlv[instrument.symbol].historyItem);
      return;
    }

    const now = new Date();
    const barCount = Math.ceil(now.getHours() - getStartOfDay().getHours());

    this._historyRepository = this._historyRepository.forConnection(connection);
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
        if (dailyInfo.low == null || dailyInfo.low > item.low) {
          dailyInfo.low = item.low;
        }
        if (dailyInfo.high == null || dailyInfo.high < item.high) {
          dailyInfo.low = item.high;
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
      this._sendToSubscribers(this._ohlv[instrument.symbol].historyItem);
      },
    );
  }

  unsubscribe(instrument: IInstrument) {
    if (!this._ohlv[instrument.symbol])
      return;


    if ((this._ohlv[instrument.symbol].count - 1) <= 0) {
      this._tradeDatafeed.unsubscribe(instrument);
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
    historyItem.volume += trade.volume;
    historyItem.instrument = trade.instrument;
    this._sendToSubscribers(historyItem);
  }

  private _sendToSubscribers(historyItem: OHLVData) {
    this._executors.forEach((fn) => {
      fn(historyItem);
    });
  }
}

function getStartOfDay() {
  const beginningOfDay = new Date();
  beginningOfDay.setHours(0, 0, 0);
  return beginningOfDay;
}
