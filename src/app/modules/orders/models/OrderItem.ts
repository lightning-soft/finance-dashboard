import {DataCell, NumberCell} from 'data-grid';
import {IOrder, OrderSide} from 'communication';

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
    ['symbol', 'size', 'executed', 'price', 'priceIn', 'status', 'type']
      .forEach((item, index) => {
          this[item].updateValue(order[item]);
      });
    this.side.updateValue(order.side === OrderSide.Buy ? 'Buy' : 'Sell');
    this.side.class = order.side ===  OrderSide.Buy ? 'up' : 'down';

  }

}


