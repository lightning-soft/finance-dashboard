import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IInstrument, IOrder, OrderSide, IPosition, OrdersRepository } from 'trading';
import { FormComponent } from 'base-components';
import { NotifierService } from 'notifier';

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent extends FormComponent<IOrder> {
  step = 0.1;
  positions = [] as IPosition[];
  orderSide = OrderSide;

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
    public notifier: NotifierService,
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
        symbol: fb.control(null, Validators.required),
        size: fb.control(this.step, Validators.min(this.step)),
        side: fb.control(null, Validators.required),
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
    return this.getRawValue();
  }

  protected handleItem(item: IOrder): void {
    super.handleItem(item);

    this.needCreate = true;
  }
}
