import { Component, OnInit } from '@angular/core';
import { FormComponent } from 'base-components';
import { FormControl, FormGroup } from '@angular/forms';
import { orderDurations, orderTypes } from 'base-order-form';
import { OrderDuration, OrderSide, OrderType } from 'trading';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'lib-create-order',
  templateUrl: './modal-order.component.html',
  styleUrls: ['./modal-order.component.scss']
})
export class ModalOrderComponent extends FormComponent<any> implements OnInit {

  orderTypes = orderTypes;
  orderDurations = orderDurations;
  stopPrice: number;
  limitPrice: number;
  OrderSide = OrderSide;
  duration = OrderDuration.DAY;
  type = OrderType.Market;
  quantity = 1;
  isEdit = false;


  isStopEnabled: boolean;

  isLimitEnabled: boolean;

  constructor(private nzModalRef: NzModalRef) {
    super();
    this.autoLoadData = {};
    this.subscribeToConnections = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this._updatePriceVisibility();
    this.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this))
      .subscribe((res) => {
        this._updatePriceVisibility();
      });
  }

  private _updatePriceVisibility() {
    const allowedStopTypes = [OrderType.StopMarket, OrderType.StopLimit];
    this.isStopEnabled = allowedStopTypes.includes(this.form.value.type);
    const allowedLimitTypes = [OrderType.Limit, OrderType.StopLimit];
    this.isLimitEnabled = allowedLimitTypes.includes(this.form.value.type);
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
