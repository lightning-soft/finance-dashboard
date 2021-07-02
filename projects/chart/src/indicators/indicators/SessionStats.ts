import { Indicator } from './Indicator';
import { sessionStatsConfig } from '../fields';

export class SessionStats extends Indicator {
  name = 'Session Stats';
  config = sessionStatsConfig;

  protected _mapGetSettings(settings: any): any {
    return settings;
  }

  protected _mapSetSettings(settings: any): any {
    return settings;
  }
}
