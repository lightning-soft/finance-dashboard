import { Injectable, NgZone } from '@angular/core';
import { Id } from 'communication';
import { DatafeedRepository, IQuote, QuoteSide, UpdateType } from 'trading';
import { lastPrices } from './fake-trade.datafeed';

// export const lastPrices = new Map<Id, number>();

@Injectable()
export class FakeLevel1Datafeed extends DatafeedRepository<IQuote> {
    protected _subscribedInstruments = [];

    constructor(_ngZone: NgZone) {
        super();
        setInterval(() => {
            const size = this._subscribedInstruments.length;
            const count = size;
            const step = 1;
            // const count = Math.floor(randomIntFromInterval(0, size)) + 1;
            // const step = Math.floor(randomIntFromInterval(0, size / 4)) + 1
            // console.time('q')

            // const size = this._subscribedInstruments.length;
            // const count = size;
            // const step = 1;

            for (let i = 0; i < count; i += step) {
                const tickSize = 0.25;
                const instrumentId = this._subscribedInstruments[i];
                const value = lastPrices.get(instrumentId);
                const isAsk = Math.random() > 0.5;
                const price = randomIntFromInterval(isAsk ? value : value - tickSize * 10, !isAsk ? value : value + tickSize * 10);
                // const bid = +randomIntFromInterval(10, 30).toFixed(0);
                const getUpdates: (price, side, updateType) => IQuote = (price, side, updateType) => {
                    const volume = +randomIntFromInterval(10, 30).toFixed(0);

                    return {
                        instrument: {
                            symbol: instrumentId,
                            exchange: 'NASDAQ',
                            id: instrumentId,
                            tickSize: 0.25,
                        },
                        timestamp: Date.now(),
                        volume,
                        price,
                        side,
                        updateType,
                        orderCount: 10
                    } as any;
                };

                // quotes.push(updates);
                this._triggerQuotes(getUpdates(price, isAsk ? QuoteSide.Ask : QuoteSide.Bid, UpdateType.Middle) as any);
                if (Math.random() > 0.7)
                    this._triggerQuotes(+getUpdates((price - tickSize).toFixed(2), QuoteSide.Bid, UpdateType.Undefined) as any);
                if (Math.random() > 0.7)
                    this._triggerQuotes(+getUpdates((price + tickSize).toFixed(2), QuoteSide.Ask, UpdateType.Undefined) as any);

            }

            // this._triggerQuotes(quotes);
            // console.timeEnd('q');
        }, 100);
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
