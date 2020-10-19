import { DataCell, NumberCell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';

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
    ['symbol', 'size', 'executed', 'price', 'priceIn', 'side', 'status', 'type']
      .forEach((item, index) => {
        this[item].updateValue(order[item]);
      });
    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;

  }

}


