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

    /*
     * 0.32 is 0.BASE_FRACTION
     * https://www.cmegroup.com/markets/interest-rates/us-treasury/ultra-10-year-us-treasury-note.contractSpecs.html#
     * Each futures with fractions have k * 1/32 (k equal 1/2 for example)
     * The problem here is next
     * When we calculated precision for 1/2 * 1/32 we have (1/2 * 1/32) * 0.64 = 0.01, precision equal 2
     * But with some numbers after fractions should be 147'315
     * So (1/2 * 1/32) * 0.32 = 0.005 fix this problem
     * WE USE THIS NUMBER ONLY FOR PRECISION
     * In future to improve calculation we can put (1/2) to instrument DTO
     */
    const _number = (_instrument.tickSize ?? _instrument.increment) * 0.32;
    const precision = this._getNumbersAfterPoint(_number);

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
