import { Cell, DateCell, NumberCell, ReadonlyCell } from 'data-grid';
import { InstrumentNameCell, } from './instrument-name.cell';
import { IQuote, IInstrument } from 'communication';

export class WatchlistItem {
    instrumentId: any;

    name: Cell;
    timestamp: Cell = new DateCell();
    ask: Cell = new NumberCell();
    bid: Cell = new NumberCell();

    constructor(instrument: IInstrument, onClick) {

      this.name = new InstrumentNameCell(instrument);
      this.instrumentId = instrument.id;

    }

    processQuote(quote: IQuote) {
        if (!quote || quote.instrumentId != this.instrumentId)
            return;

        this.ask.updateValue(quote.ask);
        this.bid.updateValue(quote.bid);
        this.timestamp.updateValue(quote.timestamp);
    }
}
