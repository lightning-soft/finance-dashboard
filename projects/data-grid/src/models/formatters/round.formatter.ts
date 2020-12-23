import { IFormatter } from './formatter';

export class RoundFormatter implements IFormatter {
  constructor(private _digits: number) {

  }

  format(value: number): string {
    return value.toFixed(this._digits);
  }

}
