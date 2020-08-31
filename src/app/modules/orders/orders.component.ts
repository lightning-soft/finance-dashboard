import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OrderItem } from './models/OrderItem';
import { IOrder, OrdersRepository } from 'communication';
import { ItemsComponent } from '../core/components';
import { IPaginationParams } from '../communication/common';
import { NotifierService } from 'notifier';

interface IOrderParams extends IPaginationParams {
  status: string;
}

@UntilDestroy()
@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent extends ItemsComponent<IOrder, IOrderParams> {
  headers = ['symbol', 'side', 'size', 'executed', 'price', 'priceIn', 'status', 'type'];

  _isList = false;

  private _status = 'Open';

  get status() {
    return this._status;
  }

  set status(value: string) {
    if (value === this.status) {
      return;
    }
    this._status = value;
    this.builder.replaceItems([]);
    this.refresh();
  }

  get params(): IOrderParams {
    return { ...this._params, status: this.status };
  }

  getOrders() {
    return this.builder.items.map(item => {
      return new OrderItem(item);
    });
  }

  constructor(
    public repository: OrdersRepository,
    public notifier: NotifierService

  ) {
    super();
    this.autoLoadData = { onInit: true };

  }

}
