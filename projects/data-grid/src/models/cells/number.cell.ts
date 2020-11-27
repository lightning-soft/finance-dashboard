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

interface INumberConfig {
  strategy?: AddClassStrategy;
  component?: string;
}
export class NumberCell extends Cell {
  class: string;
  value: string;
  component: string;

  _value: number;

  private strategy = AddClassStrategy.RELATIVE_PREV_VALUE;

  constructor(config?: INumberConfig | AddClassStrategy) {
    super();
    if (typeof config === 'object') {
      this.strategy = config.strategy ?? AddClassStrategy.RELATIVE_PREV_VALUE;
      this.component = config.component;
    } else if (config != null)
      this.strategy = config ?? AddClassStrategy.RELATIVE_PREV_VALUE;
  }

  updateValue(value: number) {
    if (typeof value !== 'number' || this._value === value)
      return;

    switch (this.strategy) {
      case AddClassStrategy.RELATIVE_PREV_VALUE:
        this.class = getProfitClass(this._value, value);
        break;
      case AddClassStrategy.RELATIVE_ZERO:
        this.class = getProfitLossClass(value);
        break;
      default:
        this.class = '';
    }
    this.value = value.toString();
    this._value = value;
  }

  clear() {
    super.clear();
    this._value = null;
  }
}
