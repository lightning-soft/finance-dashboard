import { Cell, ICellConfig } from './cell';
import { DateTimeFormatter, IFormatter } from '../formatters';

export interface DateCellConfig extends ICellConfig {
  formatter: IFormatter;
}

export class DateCell<T = any> extends Cell {
  _value: any;
  value: string;
  formatter: IFormatter = new DateTimeFormatter();

  constructor(config?: DateCellConfig) {
    super(config);
    if (config.formatter)
      this.formatter = config.formatter;
  }

  updateValue(value: number, force = false) {
    if (!force && this._value == value)
      return;

    this._value = value;
    this.value = value !== null && this.formatter.format(value);
  }
}
