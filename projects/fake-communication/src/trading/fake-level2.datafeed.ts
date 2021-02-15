// import { Injectable, NgZone } from '@angular/core';
// import { Id } from 'communication';
// import { DatafeedRepository, IInstrument, L2 } from 'trading';
// import { OrderSide } from 'trading';
// import { lastPrices } from './fake-level1.datafeed';
// import { Level2DataFeed } from 'trading';

// @Injectable()
// export class FakeLevel2Datafeed extends DatafeedRepository implements Level2DataFeed {
//   protected _subscribedInstruments = [];

//   constructor(_ngZone: NgZone) {
//     super();
//     setInterval(() => {
//       const size = this._subscribedInstruments.length;
//       const count = Math.floor(randomIntFromInterval(0, size)) + 1;
//       const step = Math.floor(randomIntFromInterval(0, size / 4)) + 1
//       // console.time('q')

//       // const size = this._subscribedInstruments.length;
//       // const count = size;
//       // const step = 1;

//       for (let i = 0; i < count; i += step) {
//         const tickSize = 0.01;
//         const instrumentId = this._subscribedInstruments[i];
//         const value = lastPrices.get(instrumentId);
//         const price = randomIntFromInterval(value - tickSize, value + tickSize);
//         const updates: L2 = {
//           instrument: {
//             symbol: instrumentId,
//             exchange: 'NASDAQ',
//             id: instrumentId,
//           },
//           timestamp: Date.now(),
//           orderId: Math.random().toString(),
//           price,
//           previousPrice: NaN,
//           side: Math.random() > 0.5 ? OrderSide.Buy : OrderSide.Sell,
//           size: +randomIntFromInterval(10, 30).toFixed(0),
//         };
//         lastPrices.set(instrumentId, price);

//         // quotes.push(updates);
//         this._triggerQuotes(updates as any);
//       }

//       // this._triggerQuotes(quotes);
//       // console.timeEnd('q');
//     }, 50);
//   }

//   unsubscribe(instrument: IInstrument) {

//   }

//   protected _subscribe(instruemntId: Id) {
//     this._subscribedInstruments.push(instruemntId);
//     if (!lastPrices.has(instruemntId))
//       lastPrices.set(instruemntId, randomIntFromInterval(10, 1000))

//     console.log('_subscribe', instruemntId);
//   }

//   protected _unsubscribe(instruemntId: Id) {
//     console.log('_subscribe', instruemntId);

//   }
// }

// function randomIntFromInterval(min, max) { // min and max included
//   return +(Math.random() * (max - min) + min).toFixed(2);
// }
