import { IFormatter } from '../formatters';
import { Cell, ICellConfig } from './cell';

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

interface INumberConfig extends ICellConfig {
  strategy?: AddClassStrategy;
  component?: string;
  formatter?: IFormatter;
  ignoreZero?: boolean;
  hightlightOnChange?: boolean;
}

export class NumberCell extends Cell {
  class: string;
  value: string;
  component: string;
  formatter: IFormatter;
  ignoreZero: boolean;
  time: number;
  hightlightOnChange = true;

  _value: number;

  private strategy = AddClassStrategy.RELATIVE_PREV_VALUE;

  constructor(config?: INumberConfig) {
    super(config);
    if (typeof config === 'object') {
      this.strategy = config.strategy ?? AddClassStrategy.RELATIVE_PREV_VALUE;
      this.component = config.component;
      this.formatter = config.formatter;
      this.ignoreZero = config.ignoreZero ?? true;
      this.hightlightOnChange = config.hightlightOnChange != false;
    } else if (config != null)
      this.strategy = config ?? AddClassStrategy.RELATIVE_PREV_VALUE;
  }

  updateValue(value: number, time?: number) {
    if (typeof value !== 'number' || this._value === value)
      return false;

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

    this._setValue(value);
    this.time = time ?? Date.now();
    this.hightlight();
    return true;
  }

  _setValue(value) {
    const settings: any = this.settings;
    if (!this.visible || this.ignoreZero && value === 0 || (settings.minToVisible != null && Math.abs(value) < settings.minToVisible))
      this.value = '';
    else
      this.value = this.formatter ? this.formatter.format(value) : (value?.toString() ?? '');

    this.drawed = false;
    this._value = value;
  }

  hightlight() {
    const settings: any = this.settings;
    if (!this.hightlightOnChange || (settings.highlightLarge === true && settings.largeSize != null && this._value < settings.largeSize))
      return;

    super.hightlight();
  }

  _visibilityChange() {
    this.refresh();
    this.drawed = false;
  }

  refresh() {
    this._setValue(this._value);
  }

  clear() {
    super.clear();
    this._value = null;
  }
}
