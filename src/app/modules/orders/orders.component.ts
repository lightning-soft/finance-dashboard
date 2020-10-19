import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IOrder, IOrderParams, OrdersRepository, OrderStatus } from 'trading';
import { LayoutNode } from 'layout';
import { NotifierService } from 'notifier';
import { ItemsComponent } from 'base-components';
import { OrderItem } from './models/OrderItem';

@UntilDestroy()
@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
@LayoutNode()
export class OrdersComponent extends ItemsComponent<IOrder, IOrderParams> {
  headers = ['symbol', 'side', 'size', 'executed', 'price', 'priceIn', 'status', 'type'];

  _isList = false;

  private _status: OrderStatus = OrderStatus.Open;

  get status() {
    return this._status;
  }

  set status(value: OrderStatus) {
    if (value === this.status) {
      return;
    }
    this._status = value;
    this.refresh();
  }

  get params(): IOrderParams {
    return { ...this._params, status: this.status };
  }

  constructor(
    public repository: OrdersRepository,
    public notifier: NotifierService,
  ) {
    super();
    this.autoLoadData = { onInit: true };

    this.builder.setParams({
      order: 'desc',
      filter: (order: IOrder) => order.status === this.status,
      map: (item: IOrder) => new OrderItem(item),
    });
  }
}
