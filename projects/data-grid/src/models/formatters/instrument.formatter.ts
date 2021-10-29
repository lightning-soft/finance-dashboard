import { IInstrument } from 'trading';
import { RoundFormatter } from './round.formatter';

export class InstrumentFormatter extends RoundFormatter {
  private _multiplier = 1;

  static forInstrument(instrument?: IInstrument) {
    if (instrument?.fraction != null && instrument?.fraction !== 0)
      return new InstrumentFormatter(instrument);

    return new RoundFormatter(instrument?.precision ?? 2);
  }

  private _getNumbersAfterPoint(number: number): number {
    if (number === null || number === undefined) return 0;

    const numberAsString = number.toString();

    if (numberAsString.includes('.')) {
      return numberAsString.split('.')[1].length;
    }

    return 0;
  }


  constructor(protected _instrument: IInstrument) {
    super(2);

    if (this._instrument == null)
      throw new Error('Please provide instrument');

    const step = _instrument.fraction.toString().length;
    this._multiplier = _instrument.fraction / (10 ** step);

    const number = _instrument.tickSize * this._multiplier;
    const precision = this._getNumbersAfterPoint(number);

    this.updateDigits(precision);
  }

  format(value: number): string {
    const prefix = value < 0 ? '-' : '';

    if (value < 0) value *= -1;

    const val = Math.floor(value);
    const decimals = value - val;

    return prefix + super.format(val + decimals * this._multiplier).replace('.', '\'');
  }
}