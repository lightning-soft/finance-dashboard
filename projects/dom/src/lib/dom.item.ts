import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, NumberCell } from 'data-grid';
import * as e from 'express';
import { ITrade } from 'trading';

export class DomItem implements IBaseItem {
  id: Id;

  _id: Cell = new NumberCell();
  price: Cell = new NumberCell({ strategy: AddClassStrategy.NONE });
  orders: Cell = new DataCell();
  ltq: Cell = new DataCell();
  bid: Cell = new DataCell();
  ask: Cell = new DataCell();
  currentTradeAsk: Cell = new DataCell();
  currentTradeBid: Cell = new DataCell();
  totalAtAsk: Cell = new DataCell();
  totalAtBid: Cell = new DataCell();
  tradeColumn: Cell = new DataCell();
  volumeProfile: Cell = new DataCell();
  askDelta: Cell = new DataCell();
  bidDelta: Cell = new DataCell();
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  class = '';

  constructor(index) {
    this.id = index;
    this._id.updateValue(index);
  }

  processTrade(quote: ITrade) {
    this.price.updateValue(quote.askInfo.price);
  }

  updatePrice(price: number, center = false) {
    this.price.updateValue(price);
    this.class = center ? 'center-price' : '';
  }
}
