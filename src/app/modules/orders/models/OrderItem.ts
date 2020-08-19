import {DataCell, NumberCell} from 'data-grid';
import {IOrder} from 'communication';

export class OrderItem {
  symbol = new DataCell();
  side = new DataCell();
  size = new NumberCell();
  executed = new NumberCell();
  price = new NumberCell();
  priceIn = new NumberCell();
  status = new DataCell();
  type = new DataCell();

  constructor(order: IOrder) {
    this.update(order);
  }

  update(order: IOrder) {
    ['symbol', 'side', 'size', 'executed', 'price', 'priceIn', 'status', 'type']
      .forEach((item, index) => {
          this[item].updateValue(order[item]);
      });
    this.side.class = this.side.value.toLowerCase() === 'buy' ? 'up' : 'down';

  }

}


