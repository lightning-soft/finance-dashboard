import { IInstrument } from 'trading';
import { RoundFormatter } from './round.formatter';

export class InstrumentFormatter extends RoundFormatter {
  private _multiplier = 1;

  static forInstrument(instrument?: IInstrument) {
    if (instrument?.fraction != null && instrument?.fraction !== 0)
      return new InstrumentFormatter(instrument);

    return new RoundFormatter(instrument?.precision ?? 2);
  }


  constructor(protected _instrument: IInstrument) {
    super(2);
    if (this._instrument == null)
      throw new Error('Please provide instrument');

    const precision = _instrument.fraction.toString().length;
    this.updateDigits(precision);
    this._multiplier = _instrument.fraction / (10 ** precision);
  }

  format(value: number): string {
    const _value = Math.abs(value);
    const val = Math.floor(_value);
    const decimals = _value - val;
    const prefix = value < 0 ? '-' : '';

    return prefix + super.format(val + decimals * this._multiplier).replace('.', '\'');
  }
}
