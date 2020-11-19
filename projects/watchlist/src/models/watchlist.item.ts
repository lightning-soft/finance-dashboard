import { Cell, DataCell, DateCell, IconCell, NumberCell, PriceCell } from 'data-grid';
import { InstrumentNameCell, } from './instrument-name.cell';
import { IQuote, IInstrument } from 'trading';
import { IBaseItem, Id } from 'communication';
import { priceComponentSelector } from 'projects/data-grid/src/models/cells/components/price-component';

export class WatchlistItem implements IBaseItem {
    id: Id;
    instrument: IInstrument;

    name: Cell;
    timestamp: Cell = new DateCell();
    ask: Cell = new NumberCell();
    bid: Cell = new NumberCell();
    volume: Cell = new NumberCell();
    price: Cell = new NumberCell({component: priceComponentSelector});
    exchange: Cell = new DataCell();
    symbol: Cell = new DataCell();
    close: Cell = new IconCell('icon-close-window');

    constructor(instrument: IInstrument) {
      this.instrument = instrument;
      this.name = new InstrumentNameCell(instrument);
      this.id = instrument.id;
    }

    processQuote(quote: IQuote) {
        if (!quote || quote.instrument.symbol !== this.instrument.symbol)
            return;

        this.ask.updateValue(quote.askInfo.price);
        this.bid.updateValue(quote.bidInfo.price);
        this.timestamp.updateValue(quote.timestamp);
        this.volume.updateValue(quote.volume);
        this.price.updateValue(quote.price);
        this.exchange.updateValue(quote.instrument.exchange);
        this.symbol.updateValue(quote.instrument.symbol);
    }
}
