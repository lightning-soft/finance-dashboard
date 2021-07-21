import { Indicator } from './Indicator';
import { zigZagConfig } from '../fields';

export class ZigZag extends Indicator {
  name = 'Zig Zag';
  config = zigZagConfig;

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
