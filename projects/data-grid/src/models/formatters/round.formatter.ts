import { IFormatter } from './formatter';
import { numberWithCommas } from "../../../../base-components/src/pipes";

export class RoundFormatter implements IFormatter {
  constructor(protected _digits: number) {
    if (this._digits == null)
      throw new Error('Please provide digits');
  }

  format(value: number): string {
    if (value == null)
      return '';

    return value.toFixed(this._digits);
  }

  updateDigits(digits: number): void {
    this._digits = digits;
  }
}

export class PriceFormatter extends RoundFormatter implements IFormatter {
  format(value: number): string {
    return numberWithCommas(value, this._digits);
  }
}

