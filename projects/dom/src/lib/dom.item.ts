import { IBaseItem, Id } from 'communication';
import { Cell, DataCell, NumberCell } from 'data-grid';
import { IQuote, ITrade } from 'trading';

export class DomItem implements IBaseItem {
  id: Id;

  price: Cell = new NumberCell();
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

  processTrade(quote: ITrade) {
    this.price.updateValue(quote.askInfo.price);
  }
}
