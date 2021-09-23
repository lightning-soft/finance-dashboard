import { RealFeed, WSMessageTypes } from './real-feed';
import { IInstrument, OnUpdateFn, SettleData, UnsubscribeFn } from 'trading';
import { RealtimeType } from './realtime';

export class RealSettleDataFeed extends RealFeed<SettleData, IInstrument> {
  type = RealtimeType.Settle;
  _lastValue: {
    [connectionId: string]: {
      [instrumentId: string]: SettleData
    }
  } = {};

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;

  on(fn: OnUpdateFn<SettleData>): UnsubscribeFn {
      for (const connectionId in this._lastValue) {
        for (const key in this._lastValue[connectionId]) {
          const value = this._lastValue[connectionId][key];
          fn(value, connectionId);
        }
      }
      return super.on(fn);
  }

  protected _handleUpdate(data, connectionId) {
    const result = super._handleUpdate(data, connectionId);
    if (result) {
      const settleData = this._getResult(data);
      if (!this._lastValue[connectionId]) {
        this._lastValue[connectionId] = {};
      }
      this._lastValue[connectionId][settleData.instrument.id] = settleData;
      return true;
    }
  }
}
