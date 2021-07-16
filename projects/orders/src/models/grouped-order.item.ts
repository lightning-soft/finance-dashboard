import { OrderColumnsArray, OrderItem } from 'base-order-form';
import { CheckboxCell, EmptyCell, RoundFormatter } from 'data-grid';

export const groupStatus = 'orderGroup';

export class GroupedOrderItem extends OrderItem {
  protected _priceFormatter = new RoundFormatter(2);
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
