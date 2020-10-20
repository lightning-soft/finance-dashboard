import { Cell, DateCell, NumberCell } from 'data-grid';
import { InstrumentNameCell, } from './instrument-name.cell';
import { IQuote, IInstrument } from 'trading';

export class WatchlistItem {
    instrumentId: any;

    name: Cell;
    timestamp: Cell = new DateCell();
    ask: Cell = new NumberCell();
    bid: Cell = new NumberCell();

    constructor(instrument: IInstrument) {

      this.name = new InstrumentNameCell(instrument);
      this.instrumentId = instrument.id;

    }

    processQuote(quote: IQuote) {
        if (!quote || quote.instrumentId !== this.instrumentId)
            return;

        this.ask.updateValue(quote.ask);
        this.bid.updateValue(quote.bid);
        this.timestamp.updateValue(quote.timestamp);
    }
}
