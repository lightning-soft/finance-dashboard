import { vwapConfig } from '../fields';
import { Indicator } from './Indicator';

export class VWAP extends Indicator {
  name = VWAP.name;
  config = vwapConfig;

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
