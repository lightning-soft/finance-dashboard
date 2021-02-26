import { Component, OnInit } from '@angular/core';
import { FormComponent } from "base-components";
import { FormControl, FormGroup } from "@angular/forms";
import { OrderDurations, OrderTypes } from 'base-order-form';
import { OrderDuration, OrderSide, OrderType } from "trading";
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lib-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent extends FormComponent<any>{

  orderTypes = OrderTypes;
  orderDurations = OrderDurations;
  price: number;
  OrderSide = OrderSide;

  constructor(private nzModalRef: NzModalRef) {
    super();
  }

  protected createForm(): FormGroup {
    return new FormGroup({
      type: new FormControl(OrderType.Market),
      quantity: new FormControl(1),
      duration: new FormControl(OrderDuration.DAY),
      stopPrice: new FormControl(this.price),
      limitPrice: new FormControl(this.price),
    });
  }


  submit(side: OrderSide) {
    this.nzModalRef.close({ ...this.formValue, side });
  }
}
