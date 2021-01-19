import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { DomHandler } from './handlers';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';

export class DomItem implements IBaseItem {
  id: Id;

  isCenter = false;

  _id: Cell = new NumberCell();
  price: PriceCell;
  lastPrice: number;
  orders: Cell = new DataCell();
  ltq: Cell = new DataCell();
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: HistogramCell;
  currentBid: HistogramCell;
  totalAsk: HistogramCell;
  totalBid: HistogramCell;
  tradeColumn: Cell = new DataCell();
  volumeProfile: HistogramCell;
  askDelta: Cell;
  bidDelta: Cell;
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  // class = '';

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new PriceCell({ strategy: AddClassStrategy.NONE, formatter: _priceFormatter, settings: settings.price });
    this.bid = new HistogramCell({ settings: settings.bid });
    this.ask = new HistogramCell({ settings: settings.ask });
    this.currentAsk = new HistogramCell({ settings: settings.currentAsk });
    this.currentBid = new HistogramCell({ settings: settings.currentBid });
    this.totalAsk = new HistogramCell({ settings: settings.totalAsk });
    this.totalBid = new HistogramCell({ settings: settings.totalBid });
    this.volumeProfile = new HistogramCell({ settings: settings.volumeProfile });
    this.askDelta = new NumberCell({ strategy: AddClassStrategy.NONE, settings: settings.askDelta });
    this.bidDelta = new NumberCell({ strategy: AddClassStrategy.NONE, settings: settings.bidDelta });
    this._id.updateValue(index);
  }

  updatePrice(price: number, data: DomHandler, center = false) {
    this.lastPrice = price;
    const acc = data.getItemData(price);
    this.price.updateValue(price);
    this.price.isTraded = acc.updatedAt != null;
    this.price.time = acc.time.price;
    // const total = data.total;
    const columns = data.columns;

    this.volumeProfile.update(acc.volume, columns.volume, acc.time.volume);
    this.currentAsk.update(acc.currentAsk, columns.currentAsk, acc.time.currentAsk);
    this.currentBid.update(acc.currentBid, columns.currentBid, acc.time.currentBid);
    this.ask.update(acc.ask, columns.ask, acc.time.ask);
    this.bid.update(acc.bid, columns.bid, acc.time.bid);
    this.totalAsk.update(acc.ask, columns.ask, acc.time.ask);
    this.totalBid.update(acc.bid, columns.bid, acc.time.bid);
    this.askDelta.updateValue(acc.currentAsk - acc.ask, acc.time.currentAsk);
    this.bidDelta.updateValue(acc.currentBid - acc.bid, acc.time.currentBid);

    this.isCenter = center;
    // if (acc.volume)
    //   this.class += 'has-volume';
  }
}
