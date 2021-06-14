import { Component } from '@angular/core';

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
  step = 1;
  min = 0;
  placeholder = '';
  dropdownVisible = true;

  set value(value) {
    if (value == null || value === '')
      return;

    this._value = +value;
    if (!this.shouldOpenSelect)
      return;

    let from = +value - (this.optionSize * this.step);
    const to = +value + (this.optionSize * this.step);
    this.options = [];

    while (from <= to) {
      this.options.push(from);
      from += this.step;
    }
  }

  get value() {
    return this._value;
  }

  openSelect() {
    if (this.shouldOpenSelect && this._value !== null)
      this.dropdownVisible = true;
  }
}
