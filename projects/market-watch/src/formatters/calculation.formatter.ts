import { RoundFormatter } from 'data-grid';

export class CalculationFormatter extends RoundFormatter {

  format(value: number): string {
    const t = 10 ** this._digits;
    return (Math.round(value * t) / t).toFixed(this._digits);
  }
}

