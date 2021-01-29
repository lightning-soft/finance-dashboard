import { IPosition, Side } from 'trading';
import { Id } from 'base-components';
import { DataCell, IconCell, NumberCell } from 'data-grid';

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
    const fields = ['price', 'size',  'instrumentName', 'unrealized', 'realized', 'total'];
    for (let key of fields) {
      this[key].updateValue(position[key]);
    }

    const iconClass = position.side !== Side.Closed ? 'icon-close-window' : 'd-none';
    this.close.updateClass(iconClass);
  }

}


