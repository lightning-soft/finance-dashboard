import { IPosition, Side } from 'trading';
import { Id } from 'base-components';
import { DataCell, IconCell, NumberCell } from 'data-grid';

export class PositionItem {
  get id(): Id | undefined {
    return this.position && this.position.id;
  }

  account = new DataCell();
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
    const fields = ['price', 'size', 'unrealized', 'realized', 'total'];
    for (let key of fields) {
      this[key].updateValue(position[key]);
    }

    const iconClass = position.side !== Side.Closed ? 'icon-close-window' : 'd-none';
    this.close.updateClass(iconClass);
  }

}


