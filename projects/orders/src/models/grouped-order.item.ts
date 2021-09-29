import { OrderColumnsArray, OrderItem } from 'base-order-form';
import { CheckboxCell, EmptyCell } from 'data-grid';

export const groupStatus = 'orderGroup';

export class GroupedOrderItem extends OrderItem {
  private _id;

  set id(value) {
    this._id = value;
  }

  get id() {
    return this._id;
  }

  constructor() {
    super();
    this.checkbox = new EmptyCell() as CheckboxCell;
    OrderColumnsArray.forEach(item => {
      this[item].changeStatus(groupStatus);
      this[item].hoverStatusEnabled = false;
    });
  }
}
