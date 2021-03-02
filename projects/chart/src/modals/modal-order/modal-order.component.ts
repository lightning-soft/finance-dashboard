import { Component } from '@angular/core';
import { FormComponent } from 'base-components';
import { FormControl, FormGroup } from '@angular/forms';
import { OrderDurations, OrderTypes } from 'base-order-form';
import { OrderDuration, OrderSide, OrderType } from 'trading';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lib-create-order',
  templateUrl: './modal-order.component.html',
  styleUrls: ['./modal-order.component.scss']
})
export class ModalOrderComponent extends FormComponent<any> {

  orderTypes = OrderTypes;
  orderDurations = OrderDurations;
  stopPrice: number;
  limitPrice: number;
  OrderSide = OrderSide;
  duration = OrderDuration.DAY;
  type = OrderType.Market;
  quantity = 1;
  isEdit = false;


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
    this.autoLoadData = {};
    this.subscribeToConnections = false;
  }

  protected createForm(): FormGroup {
    return new FormGroup({
      type: new FormControl(this.type),
      quantity: new FormControl(this.quantity),
      duration: new FormControl(this.duration.toUpperCase()),
      stopPrice: new FormControl(this.stopPrice),
      limitPrice: new FormControl(this.limitPrice),
    });
  }


  submit(side: OrderSide) {
    this.nzModalRef.close({ ...this.formValue, side });
  }

  save() {
    this.nzModalRef.close({ ...this.formValue });
  }
}
