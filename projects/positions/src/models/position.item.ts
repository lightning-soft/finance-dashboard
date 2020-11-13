import { IPosition } from 'trading';
import { Id } from 'base-components';
import { Cell, DataCell, IconCell, NumberCell } from 'data-grid';

export class PositionItem {
  get id(): Id | undefined {
    return this.position && this.position.id;
  }

  account: Cell;
  price: Cell;
  size: Cell;
  unrealized: Cell;
  realized: Cell;
  total: Cell;
  close = new IconCell('icon-close-window');
  position: IPosition;


  constructor(position?: IPosition) {
    if (!position) {
      return;
    }
    this.update(position);
  }

  update(position: IPosition) {
    this.position = position;
    this.account = new DataCell();
    this.account.updateValue(position.account);
    const fields = ['price', 'size', 'unrealized', 'realized', 'total'];
    for (let key of fields) {
      this[key] = new NumberCell();
      this[key].updateValue(position[key]);
    }
  }

}


