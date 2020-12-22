import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, NumberCell } from 'data-grid';
import { ITrade } from 'trading';
import { IFormatter } from 'data-grid';
import { TotalAccomulator } from './accomulators';
import { HistogramCell } from './histogram';
import { DomSettings } from './dom-settings/settings';

export class DomItem implements IBaseItem {
  id: Id;

  _id: Cell = new NumberCell();
  price: Cell;
  orders: Cell = new DataCell();
  ltq: Cell = new DataCell();
  bid: HistogramCell;
  ask: HistogramCell;
  currentTradeAsk: Cell = new DataCell();
  currentTradeBid: Cell = new DataCell();
  totalAtAsk: Cell = new DataCell();
  totalAtBid: Cell = new DataCell();
  tradeColumn: Cell = new DataCell();
  volumeProfile: HistogramCell;
  askDelta: Cell = new DataCell();
  bidDelta: Cell = new DataCell();
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  class = '';

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new NumberCell({ strategy: AddClassStrategy.NONE, formatter: _priceFormatter });
    this.bid = new HistogramCell({ settings: settings.bid });
    this.ask = new HistogramCell({ settings: settings.ask });
    this.volumeProfile = new HistogramCell({ settings: settings.volumeProfile });
    this._id.updateValue(index);
  }

  updatePrice(price: number, trade: ITrade, acc: TotalAccomulator, total: TotalAccomulator, center = false) {
    this.price.updateValue(price);
    this.volumeProfile.update(acc.volume, total.volume);
    this.ask.update(acc.ask, total.ask);
    this.bid.update(acc.bid, total.bid);
    this.class = center ? 'center-price ' : '';

    if (acc.volume)
      this.class += 'has-volume';
  }
}
