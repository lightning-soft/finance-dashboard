import { IFormatter } from './formatter';

export class RoundFormatter implements IFormatter {
  constructor(private _digits: number) {
    if (this._digits == null)
      throw new Error('Please provide digits');
  }

  format(value: number): string {
    if (!value)
      return '';

    return value.toFixed(this._digits);
  }
}
