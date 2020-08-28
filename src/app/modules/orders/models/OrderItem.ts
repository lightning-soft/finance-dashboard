import { DataCell, NumberCell } from 'data-grid';
import { IOrder, OrderSide, OrderStatus, OrderType } from 'communication';

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
    ['symbol', 'size', 'executed', 'price', 'priceIn']
      .forEach((item, index) => {
        this[item].updateValue(order[item]);
      });
    this.side.updateValue(order.side === OrderSide.Buy ? 'Buy' : 'Sell');
    this.side.class = order.side === OrderSide.Buy ? 'up' : 'down';
    this.status.updateValue(order.status === OrderStatus.Open ? 'Open' : 'Close');
    this.type.updateValue(order.type === OrderType.Market ? 'Market' : 'Else');

  }

}


