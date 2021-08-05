import { Indicator } from './Indicator';
import { zigZagOscillatorConfig } from '../fields';

export class ZigZagOscillator extends Indicator {
  name = 'Zig Zag Oscillator';
  config = zigZagOscillatorConfig;

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
