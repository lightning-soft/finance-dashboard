import { Injectable, Type } from '@angular/core';
import { Id } from 'communication';
import { IInstrument, IQuote } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealLevel1DataFeed extends RealFeed<IQuote, IInstrument> {
  type = RealtimeType.Quote;

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
  // '{"type":"Quote","result":{"instrument":{"id":"ESH2.CME","symbol":"ESH2","exchange":"CME",
  // "currency":null,"stringTypeRepresentation":null,
  // "productCode":null,"description":null,"increment":null,"precision":null,"contractSize":0,"fraction":null,"type":null},
  // "side":"Ask","timestamp":1640176996347,"price":4645.5,"orderCount":52,"volume":115,"updateType":"Begin"}}'

  // protected _handleUpdate(data, connectionId: Id): boolean {
  //   if (data.type === this.type) {
  //     super._handleUpdate(data, connectionId);
  //     const isAsk = data.result.side === 'Ask';
  //     // const increment = (isAsk ? 1 : -1) * 0.25;
  //     const increment = (isAsk ? 1 : -1) * 0.5;
  //     const newData = {
  //       ...data,
  //       result: {
  //         ...data.result,
  //         price: data.result.price + increment,
  //         timestamp: Date.now(),
  //       },
  //     };

  //     return super._handleUpdate(newData, connectionId);
  //   } else {
  //     return super._handleUpdate(data, connectionId);
  //   }
  // }
}

