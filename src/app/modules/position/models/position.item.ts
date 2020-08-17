import { Cell, DataCell, NumberCell } from 'data-grid';
import { IPosition } from '../../communication/trading/models';
import { IconCell } from '../../data-grid/models/cells/icon.cell';

export class PositionItem {
  account: Cell;
  price: Cell;
  size: Cell;
  unrealized: Cell;
  realized: Cell ;
  total: Cell;
  click = new IconCell('icon-close');
  id: string | number | string[] | number[];

  constructor(position?: IPosition, clickHandler?: Function) {
    if (!position) {
      return;
    }
    this.update(position);
    if (clickHandler)
      this.click.click = clickHandler;
  }

  update(position: IPosition){
    this.account = new DataCell();
    this.account.updateValue(position.account);
    this.id = position.id;
    const fields  = ['price', 'size', 'unrealized', 'realized', 'total'];
    for (let key of fields) {
      this[key] = new NumberCell();
      this[key].updateValue(position[key]);
    }
  }

}


