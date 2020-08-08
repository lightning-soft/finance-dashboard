import {Cell} from './cell';

export class DataCell<T = any> extends Cell {
  value: string;
  class: string;

  constructor(private transformFunction?: (value: T) => string) {
    super();
  }

  updateValue(value: T) {
    const newValue = this.transformFunction ? this.transformFunction(value) : value;

    if (!newValue || this.value === newValue)
      return;

    this.value = typeof newValue === 'string'
      ? newValue
      : newValue.toString ? newValue.toString() : '';
  }
}
