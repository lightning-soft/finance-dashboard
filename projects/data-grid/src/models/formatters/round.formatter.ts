import { IFormatter } from './formatter';
import { numberWithCommas } from '../../../../base-components/src/pipes';

export class RoundFormatter implements IFormatter {
  constructor(protected _digits: number) {
    if (this._digits == null)
      throw new Error('Please provide digits');
  }

  format(value: number): string {
    if (value == null)
      return '';

    const t = 10 ** this._digits;

    /*
     * (Math.round(value * t) / t).toFixed(digits)
     * This avoiding us from -0.00
     * This is happened when -0.000123123 rounded to 2 digits
    */
    return (Math.round(value * t) / t).toFixed(this._digits);
  }

  updateDigits(digits: number): void {
    this._digits = digits;
  }
}


// Todo: investigate where we need comas and implement parameter in instrument parameter
export class PriceFormatter extends RoundFormatter implements IFormatter {
  format(value: number): string {
    return numberWithCommas(value, this._digits);
  }
}

