import { Cell, DateCell, NumberCell, ReadonlyCell } from 'data-grid';
import { IInstrument } from './instrument';
import { InstrumentNameCell } from './instrument-name.cell';
import { IQuote } from './quote';

export class WatchlistItem {
    _instrumentId: any;
    instrumentId: Cell = new ReadonlyCell('');
    name: Cell;
    timestamp: Cell = new DateCell();
    ask: Cell = new NumberCell();
    bid: Cell = new NumberCell();

    constructor(instrument: IInstrument) {
        this.name = new InstrumentNameCell(instrument);
        this._instrumentId = instrument.id;
    }

    processQuote(quote: IQuote) {
        if (!quote || quote.instrumentId != this._instrumentId)
            return;

        this.ask.updateValue(quote.ask);
        this.bid.updateValue(quote.bid);
        this.timestamp.updateValue(quote.timestamp);
    }
}
