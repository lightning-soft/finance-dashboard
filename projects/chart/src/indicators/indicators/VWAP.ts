import { zigZagConfig } from '../fields';
import { Indicator } from './Indicator';

export class VWAP extends Indicator {
  name = 'VWAP';
  config = zigZagConfig;

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
