import { Component, OnInit } from '@angular/core';
import { FormComponent } from 'base-components';
import { FormControl, FormGroup } from '@angular/forms';
import { OrderDurations, OrderTypes } from 'base-order-form';
import { OrderDuration, OrderSide, OrderType } from 'trading';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lib-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent extends FormComponent<any> {

  orderTypes = OrderTypes;
  orderDurations = OrderDurations;
  stopPrice: number;
  limitPrice: number;
  OrderSide = OrderSide;
  duration = OrderDuration.DAY;
  type = OrderType.Market;
  quantity = 1;

  get isStopEnabled() {
    const orderTypes = [OrderType.StopMarket, OrderType.StopLimit];
    return orderTypes.includes(this.form.value.type);
  }

  get isLimitEnabled() {
    const orderTypes = [OrderType.Limit, OrderType.StopLimit];
    return orderTypes.includes(this.form.value.type);
  }

  constructor(private nzModalRef: NzModalRef) {
    super();
  }

  protected createForm(): FormGroup {
    return new FormGroup({
      type: new FormControl(this.type),
      quantity: new FormControl(this.quantity),
      duration: new FormControl(this.duration),
      stopPrice: new FormControl(this.stopPrice),
      limitPrice: new FormControl(this.limitPrice),
    });
  }


  submit(side: OrderSide) {
    this.nzModalRef.close({ ...this.formValue, side });
  }
}
