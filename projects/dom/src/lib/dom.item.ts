import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, NumberCell } from 'data-grid';
import { ITrade } from 'trading';
import { IFormatter } from 'data-grid';
import { HistogramCell } from './histogram.cell';
import { TotalAccomulator } from './accomulators';

export class DomItem implements IBaseItem {
  id: Id;

  _id: Cell = new NumberCell();
  price: Cell = new NumberCell({ strategy: AddClassStrategy.NONE });
  orders: Cell = new DataCell();
  ltq: Cell = new DataCell();
  bid: HistogramCell = new HistogramCell();
  ask: HistogramCell = new HistogramCell();
  currentTradeAsk: Cell = new DataCell();
  currentTradeBid: Cell = new DataCell();
  totalAtAsk: Cell = new DataCell();
  totalAtBid: Cell = new DataCell();
  tradeColumn: Cell = new DataCell();
  volumeProfile: HistogramCell = new HistogramCell();
  askDelta: Cell = new DataCell();
  bidDelta: Cell = new DataCell();
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  class = '';

  constructor(index, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new NumberCell({ strategy: AddClassStrategy.NONE, formatter: _priceFormatter });
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
