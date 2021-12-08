import { Component } from '@angular/core';
import { IInstrument } from 'trading';
import { InstrumentFormatter, RoundFormatter } from "../../../data-grid";

@Component({
  selector: 'number-wrapper',
  templateUrl: './number-wrapper.component.html',
  styleUrls: ['./number-wrapper.component.scss']
})
export class NumberWrapperComponent {
  private _value;
  options = [];

  optionSize = 30;
  shouldOpenSelect = true;
  min = 0;
  placeholder = '';

  private _instrument: IInstrument;
  private _formatter = new RoundFormatter(0);

  set instrument(value: IInstrument) {
    this._instrument = value;
    if (value) {
      this._formatter = InstrumentFormatter.forInstrument(value);
    } else this.min = 1;
  }

  get instrument() {
    return this._instrument;
  }

  get step() {
    return this._instrument.tickSize ?? 1;
  }

  dropdownVisible = true;

  set value(value) {
    if (value == null || value === '')
      return;

    this._value = +value;
    if (!this.shouldOpenSelect)
      return;

    const step = this.instrument.tickSize ?? 1;

    let from = +value + (this.optionSize * step);
    const to = +value - (this.optionSize * step);
    this.options = [];

    while (from >= to) {
      this.options.push({ label: this._formatter.format(from), value: from });
      from -= this.instrument.tickSize;
    }
  }

  get value() {
    return this._value;
  }

  formatter = (price) => this._formatter.format(price);


  openSelect() {
    if (this.shouldOpenSelect && this._value !== null)
      this.dropdownVisible = true;
  }
}
