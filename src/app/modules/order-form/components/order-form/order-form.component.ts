import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IInstrument, IOrder, IPosition, OrdersRepository } from 'communication';
import { FormComponent } from 'core';
import {NotifierService} from '../../../ui';

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent extends FormComponent<IOrder> {
  step = 0.1;
  positions = [] as IPosition[];

  get volume() {
    return this.form.value.volume;
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
        volume: fb.control(this.step, Validators.min(this.step)),
        operation: fb.control(null, Validators.required)
      }
    );
  }


  addVolume(value) {
    const result = +(value + this.volume).toFixed(1);
    if (result >= 0.1) {
      this.form.patchValue({ volume: result });
    }
  }
}
