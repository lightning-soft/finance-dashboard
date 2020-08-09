import { Id, Datafeed } from "communication";

export class FakeDatafeed extends Datafeed {
    protected _subscribedInstruments = [];

    protected _lastPrices = new Map<Id, number>()

    constructor() {
        super();
        setInterval(() => {
            // const size = this._subscribedInstruments.length;
            // const count = Math.floor(randomIntFromInterval(0, size))
            // const step = Math.floor(randomIntFromInterval(0, size / 4)) + 1
            console.time('q')

            const size = this._subscribedInstruments.length;
            const count = size;
            const step = 1;
            const quotes = [];
            for (let i = step; i < count; i += step) {
                const instrumentId = this._subscribedInstruments[i];
                const updates = {};

                for (const key of ['ask', 'bid']) {
                    const value = this._lastPrices.get(instrumentId);
                    updates[key] = randomIntFromInterval(value - 10, value + 10);
                    this._lastPrices.set(instrumentId, updates[key]);
                }

                quotes.push({
                    instrumentId,
                    timestamp: new Date(),
                    ...updates,
                } as any);
            }

            this._triggerQuotes(quotes);
            console.timeEnd('q');
        }, 100)
    }

    protected _subscribe(instruemntId: Id) {
        this._subscribedInstruments.push(instruemntId);
        this._lastPrices.set(instruemntId, randomIntFromInterval(10, 1000))
        console.log('_subscribe', instruemntId);
    }

    protected _unsubscribe(instruemntId: Id) {
        console.log('_subscribe', instruemntId);
    }
}

function randomIntFromInterval(min, max) { // min and max included 
    return +(Math.random() * (max - min + 1) + min).toFixed(4);
}