import { Inject, Injectable, Injector } from '@angular/core';
import {
  HistoryRepository,
  IInstrument,
  OHLVData,
  OHLVFeed,
  OnUpdateFn,
  Periodicity,
  TradeDataFeed,
  VolumeData,
  VolumeDataFeed,
} from 'trading';
import { AccountsManager } from 'accounts-manager';
import { Id } from 'communication';

const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
};

@Injectable()
export class RealOHLVFeed extends OHLVFeed {
  private _executors: OnUpdateFn<OHLVData>[] = [];

  constructor(
    protected _injector: Injector,
    private _historyRepository: HistoryRepository,
    private _tradeDatafeed: TradeDataFeed,
    private _volumeDatafeed: VolumeDataFeed,
    @Inject(AccountsManager) protected _accountsManager: AccountsManager,
  ) {
    super();

    this._tradeDatafeed.on(this.handleTrade);
    this._volumeDatafeed.on(this.handleVolume);
  }

  private _ohlv: {
    [connectionId: string]: {
      [instrumentId: string]: {
        count: number,
        historyItem: OHLVData,
      }
    }
  } = {};

  on(fn: OnUpdateFn<OHLVData>) {
    this._executors.push(fn);

    return () => {
      this._executors = this._executors.filter(executor => executor !== fn);
    };
  }


  subscribe(instrument: IInstrument, connectionId: Id) {
    if (!instrument || !connectionId)
      return;

    if (!this._ohlv[connectionId])
      this._ohlv[connectionId] = {};

    const obj = this._ohlv[connectionId];

    if (obj[instrument.id]?.count) {
      obj[instrument.id].count += 1;
      this._sendToSubscribers(obj[instrument.id].historyItem, connectionId);
      return;
    }

    this._tradeDatafeed.subscribe(instrument, connectionId);
    this._volumeDatafeed.subscribe(instrument, connectionId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    this._historyRepository.getItems({
      productCode: instrument.productCode,
      Exchange: instrument.exchange,
      Symbol: instrument.symbol,
      ...historyParams,
      endDate,
      startDate,
      connectionId
    }).toPromise().then(res => {
      const data = res.data;
      if (!data || !data.length)
        return;

      const dailyInfo = {
        open: data[0].open,
        low: null,
        high: data[0].high,
        volume: 0,
        date: new Date(),
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

      if (!obj[instrument.id]) {
        obj[instrument.id] = { count: 0 } as any;
      }

      const ohlv = obj[instrument.id];
      ohlv.count += 1;
      ohlv.historyItem = dailyInfo as OHLVData;
      ohlv.historyItem.instrument = instrument;
      ohlv.historyItem = normalizeHistoryItem(ohlv.historyItem);
      this._sendToSubscribers(ohlv.historyItem, connectionId);
    });
  }


  unsubscribe(instrument: IInstrument, connecionId: Id) {
    if (!this._ohlv[connecionId])
      return;

    const obj = this._ohlv[connecionId];

    if (!obj || !obj[instrument?.id])
      return;

    obj[instrument.id].count -= 1;
    if (obj[instrument?.id].count < 1) {
      this._tradeDatafeed.unsubscribe(instrument, connecionId);
      this._volumeDatafeed.unsubscribe(instrument, connecionId);
    }
  }

  handleTrade = (trade, connectionId: Id) => {
    if (!this._ohlv[connectionId])
      return;

    const ohlvHandler = this._ohlv[connectionId][trade.instrument.id];
    if (!ohlvHandler || !ohlvHandler.count) {
      return;
    }

    let historyItem = this._ohlv[connectionId][trade.instrument.id].historyItem;
    if (historyItem.date.getTime() > trade.timestamp)
      return;

    historyItem.close = trade.price;

    if (trade.price < historyItem.low) {
      historyItem.low = trade.price;
    }

    if (trade.price > historyItem.high) {
      historyItem.high = trade.price;
    }
    historyItem.date = new Date(trade.timestamp);
    historyItem = normalizeHistoryItem(historyItem);
    this._ohlv[connectionId][trade.instrument.id].historyItem = historyItem;

    this._sendToSubscribers(historyItem, connectionId);
  }

  handleVolume = (data: VolumeData, connectionId: Id) => {
    if (!this._ohlv[connectionId])
      return;

    const ohlvHandler = this._ohlv[connectionId][data.instrument.id];
    if (!ohlvHandler?.count) {
      return;
    }

    ohlvHandler.historyItem.volume = data.volume;
    const historyItem = ohlvHandler.historyItem;
    this._sendToSubscribers(historyItem, connectionId);
  }

  private _sendToSubscribers(historyItem: OHLVData, connectionId: Id) {
    this._executors.forEach((fn) => {
      fn(historyItem, connectionId);
    });
  }
}

function normalizeHistoryItem(historyItem: OHLVData): OHLVData {
  const data = { ...historyItem };
  const precision = historyItem.instrument.precision;
  data.low = +data.low.toFixed(precision);
  data.high = +data.high.toFixed(precision);
  data.open = +data.open.toFixed(precision);
  data.close = +data.close.toFixed(precision);
  return data;
}
