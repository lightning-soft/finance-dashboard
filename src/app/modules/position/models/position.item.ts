import {Cell, DataCell, NumberCell} from 'data-grid';
import {EmptyCell} from '../../data-grid/models/cells/empty.cell';
import {IPosition} from '../../communication/trading/models';

export class PositionItem {
  account: Cell = new EmptyCell();
  price: Cell = new EmptyCell();
  size: Cell = new EmptyCell();
  unrealized: Cell = new EmptyCell();
  realized: Cell = new EmptyCell();
  total: Cell = new EmptyCell();

  constructor(position?: IPosition) {
    if (!position) {
      return;
    }
    this.update(position);
  }

  update(position: IPosition){
    this.account = new DataCell();
    this.account.updateValue(position.account);
    const fields  = ['price', 'size', 'unrealized', 'realized', 'total'];
    for (let key of fields) {
      this[key] = new NumberCell();
      this[key].updateValue(position[key]);
    }
  }

}


