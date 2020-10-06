import { IPosition } from 'trading'; //Error
import { Id } from 'core';
import { Cell, DataCell, NumberCell } from 'data-grid';
import { IconCell } from '../../data-grid/models/cells/icon.cell';

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
  close = new IconCell('icon-close');
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


