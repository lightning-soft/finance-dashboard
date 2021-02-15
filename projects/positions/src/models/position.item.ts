import { Id } from 'base-components';
import { DataCell, IconCell, NumberCell } from 'data-grid';
import { IPosition, IQuote, Side } from 'trading';

export class PositionItem {
  get id(): Id | undefined {
    return this.position && this.position.id;
  }

  account = new DataCell();
  instrumentName = new DataCell();
  exchange = new DataCell();
  price = new NumberCell();
  size = new NumberCell();
  unrealized = new NumberCell();
  realized = new NumberCell();
  total = new NumberCell();
  close = new IconCell();
  side = new DataCell();
  position: IPosition;


  constructor(position?: IPosition) {
    if (!position) {
      return;
    }
    this.update(position);
  }

  update(position: IPosition) {
    this.position = { ...this.position, ...position };
    this.account.updateValue(position.accountId);
    this.instrumentName.updateValue(this.position.instrument.symbol);
    this.exchange.updateValue(this.position.instrument.exchange);

    const fields = ['price', 'size',  'instrumentName', 'unrealized', 'realized', 'total', 'side'];
    for (let key of fields) {
      this[key].updateValue(position[key]);
    }

    const iconClass = position.side !== Side.Closed ? 'icon-close-window' : 'd-none';
    this.close.updateClass(iconClass);
  }

  public updateUnrealized(trade: IQuote) {
    const currentPrice = +this.price.value;
    const { volume, price } = trade;

    switch (this.side.value) {
      case Side.Long:
        this.unrealized.updateValue(this._calculateLongUnrealized(currentPrice, volume, price));
        break;

      case Side.Short:
        this.unrealized.updateValue(this._calculateShortUnrealized(currentPrice, volume, price));
        break;
    }
  }

  private _calculateLongUnrealized(currentPrice: number, volume: number, price: number): number {
    return ((currentPrice * volume) - (price * volume));
  }

  private _calculateShortUnrealized(currentPrice: number, volume: number, price: number): number {
    return ((price * volume) - (currentPrice * volume));
  }

}


