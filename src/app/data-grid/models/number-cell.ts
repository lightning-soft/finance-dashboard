import { Cell } from './cell';
// import { IFormatter } from '../../Formatters/formatter';

export enum ProfitClass {
  UP = 'up',
  NONE = '',
  DOWN = 'down'
}

export function getProfitLossClass(value: number): string {
  return value < 0 ? ProfitClass.DOWN : ProfitClass.UP;
}

export function getProfitClass(prevVal: number | string, nextVal: number | string): ProfitClass {
  if (prevVal > nextVal)
    return ProfitClass.DOWN;

  if (prevVal < nextVal)
    return ProfitClass.UP;

  return ProfitClass.NONE;
}

export enum AddClassStrategy {
  NONE,
  RELATIVE_PREV_VALUE,
  RELATIVE_ZERO,
}

export class NumberCell extends Cell {
  class: string;
  value: string;

  _value: number;

  // constructor(private _numberFormatter?: IFormatter, private _addClassStrategy = AddClassStrategy.RELATIVE_PREV_VALUE) {
  constructor(private _numberFormatter?: any, private _addClassStrategy = AddClassStrategy.RELATIVE_PREV_VALUE) {
    super();
  }

  updateValue(value: number) {
    if (typeof value !== 'number' || this._value === value)
      return;

    switch (this._addClassStrategy) {
      case AddClassStrategy.RELATIVE_PREV_VALUE:
        this.class = getProfitClass(this._value, value);
        break;
      case AddClassStrategy.RELATIVE_ZERO:
        this.class = getProfitLossClass(value);
        break;
      default:
        this.class = '';
    }
    this.value = this._numberFormatter ? this._numberFormatter.format(value) : value.toString();
    this._value = value;
  }

  clear() {
    super.clear();
    this._value = null;
  }
}
