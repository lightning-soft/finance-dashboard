import { Injectable, NgZone } from '@angular/core';
import { Id } from 'communication';
import { DatafeedRepository, OrderSide, TradeDataFeed, TradePrint } from 'trading';

export const lastPrices = new Map<Id, number>();

@Injectable()
export class FakeTradeDatafeed extends DatafeedRepository<TradePrint> implements TradeDataFeed {
    protected _subscribedInstruments = [];

    constructor(_ngZone: NgZone) {
        super();
        setInterval(() => {
            const size = this._subscribedInstruments.length;
            const count = Math.floor(randomIntFromInterval(0, size)) + 1;
            const step = Math.floor(randomIntFromInterval(0, size / 4)) + 1;
            // console.time('q')

            // const size = this._subscribedInstruments.length;
            // const count = size;
            // const step = 1;
            const quotes: TradePrint[] = [];
            for (let i = 0; i < count; i += step) {
                const tickSize = 0.25;
                const instrumentId = this._subscribedInstruments[i];
                const value = lastPrices.get(instrumentId);
                const price = randomIntFromInterval(value - tickSize, value + tickSize, tickSize);
                // const price = randomIntFromInterval(price - tickSize * 2, price);
                // const askPrice = randomIntFromInterval(price, price + tickSize * 2);

                const volume = +randomIntFromInterval(10, 30).toFixed(0);
                // const bid = +randomIntFromInterval(10, 30).toFixed(0);
                const updates: TradePrint = {
                    instrument: {
                        symbol: instrumentId,
                        exchange: 'NASDAQ',
                        id: instrumentId,
                        tickSize: 0.25,
                    },
                    timestamp: Date.now(),
                    volume,
                    price,
                    volumeBuy: 0,
                    volumeSell: 0,
                    side: Math.random() > 0.5 ? OrderSide.Buy : OrderSide.Sell,
                };
                lastPrices.set(instrumentId, price);

                // quotes.push(updates);
                this._triggerQuotes(updates as any);
            }

            // this._triggerQuotes(quotes);
            // console.timeEnd('q');
        }, 300);
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

function randomIntFromInterval(min, max, step = 0) { // min and max included
    const res = +(Math.random() * (max - min) + min);

    if (step) {
        const count = Math.round(res / step);

        return +(count * step).toFixed(2);
    }


    return +res.toFixed(2);
}
