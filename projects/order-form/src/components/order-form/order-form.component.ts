import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormComponent } from 'base-components';
import { IInstrument, IOrder, OrderDuration, OrderSide, OrdersRepository, OrderType } from 'trading';

enum DynamicControl {
  LimitPrice = 'limitPrice',
  StopPrice = 'stopPrice'
}

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent extends FormComponent<IOrder> implements OnInit {
  OrderDurations = Object.values(OrderDuration);
  OrderTypes = Object.values(OrderType);
  step = 0.1;
  OrderSide = OrderSide;

  get volume() {
    return this.form.value.size;
  }

  private _instrument: IInstrument;

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    this._instrument = value;
    this._handleInstrumentChange();
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  constructor(
    protected fb: FormBuilder,
    protected _repository: OrdersRepository,
    protected _injector: Injector,
  ) {
    super();
    this.autoLoadData = false;
  }

  private _handleInstrumentChange() {

  }

  createForm() {
    const fb = this.fb;
    return fb.group(
      {
        accountId: fb.control(null, Validators.required),
        symbol: fb.control(null, Validators.required),
        type: fb.control(OrderType.Market, Validators.required),
        quantity: fb.control(this.step, Validators.min(this.step)),
        duration: fb.control(OrderDuration.GTC, Validators.required),
        side: fb.control(null, Validators.required),
        limitPrice: fb.control(null, Validators.required),
        stopPrice: fb.control(null, Validators.required)
      }
    );
  }

  apply(e?) {
    super.apply(e);
  }

  addVolume(value) {
    let volume = +(value + this.volume).toFixed(1);
    if (volume < this.step)
      volume = this.step;

    this.form.patchValue({ size: volume });
  }

  submit(side: OrderSide) {
    this.form.patchValue({ side, symbol: this.instrument.id });
    this.apply();
  }

  getDto() {
    let dto: IOrder;

    dto = this.getRawValue();
    dto = this.filterByOrderType(dto);

    return dto;
  }

  private filterByOrderType(order: IOrder): IOrder {
    const result = Object.assign({}, order);
    const orderType = order.type;

    if (orderType !== OrderType.Limit && orderType !== OrderType.StopLimit)
      delete result[DynamicControl.LimitPrice];

    if (orderType !== OrderType.StopMarket && orderType !== OrderType.StopLimit)
      delete result[DynamicControl.StopPrice];

    return result;
  }

  protected handleItem(item: IOrder): void {
    super.handleItem(item);

    this.needCreate = true;
  }
}
