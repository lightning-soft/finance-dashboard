import { IViewItem } from 'base-components';
import { Id } from 'communication';
import { DataCell, DateCell, IconCell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';

export class OrderItem implements IViewItem<IOrder> {
  exchange = new DateCell();
  symbol = new DataCell();
  fcmId = new DataCell();
  identifier = new DataCell();
  ibId = new DataCell();
  averageFillPrice = new DataCell();
  description = new DataCell();
  duration = new DataCell();
  filledQuantity = new DataCell();
  quantity = new DataCell();
  side = new DataCell();
  status = new DataCell();
  type = new DataCell();
  close = new IconCell('icon-close-window');
  order: IOrder;

  get id(): Id {
    return this.order.id;
  }

  constructor(order: IOrder) {
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };
    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type']
      .forEach((item) => {
        this[item].updateValue(order[item]);
      });

    ['exchange', 'symbol']
      .forEach((item) => {
        this[item].updateValue(order.instrument[item]);
      });

    ['fcmId', 'ibId']
      .forEach((item) => {
        this[item].updateValue(order.account[item]);
      });

    this.identifier.updateValue(order.id);

    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;
  }

}


