import { Cell, ICellConfig } from './cell';

interface IDataCellConfig<T> extends ICellConfig {
  transformFunction?: (value: T) => string;
}

export class DataCell<T = any> extends Cell {
  value: string;
  class: string;

  constructor(private config?: IDataCellConfig<T>) {
    super(config);
  }

  updateValue(value: T) {
    const newValue = this.config?.transformFunction ? this.config.transformFunction(value) : value;

    if (newValue == null || this.value === newValue)
      return;

    this.drawed = false;
    this.value = typeof newValue === 'string'
      ? newValue
      : newValue.toString ? newValue.toString() : '';
  }
}
