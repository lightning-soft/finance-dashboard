import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { DomHandler } from './handlers';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';

export class DomItem implements IBaseItem {
  id: Id;

  _id: Cell = new NumberCell();
  price: Cell;
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
  askDelta: Cell = new NumberCell({ strategy: AddClassStrategy.NONE });
  bidDelta: Cell = new NumberCell({ strategy: AddClassStrategy.NONE });
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  class = '';

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new NumberCell({ strategy: AddClassStrategy.NONE, formatter: _priceFormatter });
    this.bid = new HistogramCell({ settings: settings.bid });
    this.ask = new HistogramCell({ settings: settings.ask });
    this.currentAsk = new HistogramCell({ settings: settings.currentAsk });
    this.currentBid = new HistogramCell({ settings: settings.currentBid });
    this.totalAsk = new HistogramCell({ settings: settings.totalAsk });
    this.totalBid = new HistogramCell({ settings: settings.totalBid });
    this.volumeProfile = new HistogramCell({ settings: settings.volumeProfile });
    this._id.updateValue(index);
  }

  updatePrice(price: number, data: DomHandler, center = false) {
    this.price.updateValue(price);
    const acc = data.getItemData(price);
    const total = data.total;
    const columns = data.columns;

    this.volumeProfile.update(acc.volume, columns.volume);
    this.currentAsk.update(acc.currentAsk, columns.currentAsk);
    this.currentBid.update(acc.currentBid, columns.currentBid);
    this.ask.update(acc.ask, columns.ask);
    this.bid.update(acc.bid, columns.bid);
    this.totalAsk.update(acc.ask, columns.ask);
    this.totalBid.update(acc.bid, columns.bid);
    this.askDelta.updateValue(acc.currentAsk - acc.ask);
    this.bidDelta.updateValue(acc.currentBid - acc.bid);

    this.class = center ? 'center-price ' : '';

    if (acc.volume)
      this.class += 'has-volume';
  }
}
