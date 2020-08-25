import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrderItem } from './models/OrderItem';
import { OrdersRepository } from 'communication';


@UntilDestroy()
@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  headers = ['symbol', 'side', 'size', 'executed', 'price', 'priceIn', 'status', 'type'];

  _isList = false;

  items: OrderItem[] = [];
  orders = [];
  status = 'Open';

  constructor(
    private repository: OrdersRepository,
  ) {
  }


  ngOnInit(): void {
    this.repository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orders = res.data;

        this.orders.forEach(
          (order) => {
            this.items.push(new OrderItem(order));
          }
        );
      });

  }


  ngOnDestroy(): void {
  }

}
