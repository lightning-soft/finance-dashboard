import { Indicator } from './Indicator';
import { barStatsConfig } from '../fields';


export class BarStats extends Indicator {
  name = 'Bar Stats';
  config = barStatsConfig;

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
