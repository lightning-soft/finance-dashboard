import { IViewItem } from 'base-components';
import { Id } from 'communication';
import { DataCell, IconCell, CheckboxCell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';

export class OrderItem implements IViewItem<IOrder> {
  exchange = new DataCell();
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
  close = new IconCell();
  checkbox = new CheckboxCell();
  order: IOrder;

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
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

    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type', 'exchange', 'symbol', 'fcmId', 'ibId', 'identifier']
      .forEach((item) => {
        this[item].changeStatus(this['side'].value.toLowerCase());
      });

    this.identifier.updateValue(order.id);

    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;
  }

  toggleSelect(event: MouseEvent): void {
    this.checkbox.toggleSelect(event);
  }

  updateSelect(selected: boolean): void {
    this.checkbox.updateValue(selected);
  }
}


