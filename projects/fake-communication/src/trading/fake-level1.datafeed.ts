import { Injectable, NgZone } from '@angular/core';
import { Id } from 'communication';
import { DatafeedRepository, ITrade } from 'trading';

export const lastPrices = new Map<Id, number>();

@Injectable()
export class FakeLevel1Datafeed extends DatafeedRepository {
  protected _subscribedInstruments = [];

  constructor(_ngZone: NgZone) {
    super();
    setInterval(() => {
      const size = this._subscribedInstruments.length;
      const count = Math.floor(randomIntFromInterval(0, size)) + 1;
      const step = Math.floor(randomIntFromInterval(0, size / 4)) + 1
      // console.time('q')

      // const size = this._subscribedInstruments.length;
      // const count = size;
      // const step = 1;
      const quotes: ITrade[] = [];
      for (let i = 0; i < count; i += step) {
        const tickSize = 0.01;
        const instrumentId = this._subscribedInstruments[i];
        const value = lastPrices.get(instrumentId);
        const price = randomIntFromInterval(value - tickSize, value + tickSize);
        const bidPrice = randomIntFromInterval(price - tickSize, price);
        const askPrice = randomIntFromInterval(price, price + tickSize);

        const ask = +randomIntFromInterval(10, 30).toFixed(0)
        const bid = +randomIntFromInterval(10, 30).toFixed(0);
        const updates: ITrade = {
          instrument: {
            symbol: instrumentId,
            exchange: 'NASDAQ',
            id: instrumentId,
          },
          timestamp: new Date(),
          volume: ask + bid,
          price,
          askInfo: {
            volume: ask,
            price: askPrice,
            orderCount: 1,
          },
          bidInfo: {
            volume: bid,
            price: bidPrice,
            orderCount: 2,
          }
        };
        lastPrices.set(instrumentId, price);

        // quotes.push(updates);
        this._triggerQuotes(updates as any);
      }

      // this._triggerQuotes(quotes);
      // console.timeEnd('q');
    }, 1000);
  }

  protected _subscribe(instruemntId: Id) {
    this._subscribedInstruments.push(instruemntId);
    if (!lastPrices.has(instruemntId))
      lastPrices.set(instruemntId, randomIntFromInterval(10, 1000))

    console.log('_subscribe', instruemntId);
  }

  protected _unsubscribe(instruemntId: Id) {
    console.log('_subscribe', instruemntId);

  }
}

function randomIntFromInterval(min, max) { // min and max included
  return +(Math.random() * (max - min) + min).toFixed(2);
}
