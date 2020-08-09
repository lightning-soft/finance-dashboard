import { Cell } from './cell';

export class DateCell<T = any> extends Cell {
  private _value: any;
  value: string;

  updateValue(value: T) {
    if (this._value == value)
      return;

    this.value = value !== null && moment(value).format('HH:mm:ss.SSS');
  }
}
