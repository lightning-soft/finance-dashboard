import {Cell, DataCell, NumberCell} from 'data-grid';
import {EmptyCell} from '../../data-grid/models/cells/empty.cell';

export class PositionItem {
  account: Cell = new EmptyCell();
  price: Cell = new EmptyCell();
  size: Cell = new EmptyCell();
  unrealized: Cell = new EmptyCell();
  realized: Cell = new EmptyCell();
  total: Cell = new EmptyCell();

  constructor(position?: Position) {
    if (!position) {
      return;
    }
    this.update(position);
  }

  update(position: Position){
    this.account = new DataCell();
    this.account.updateValue(position.account);

    // tslint:disable-next-line:forin
    for (let key in position) {
      if (key === 'account') {
        continue;
      }
      this[key] = new NumberCell();
      this[key].updateValue(position[key]);
    }
  }

}

export class Position {
  account: string;
  price: number;
  size: number;
  realized: number;
  unrealized: number;
  total: number;
}
