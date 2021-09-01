import { Indicator } from './Indicator';


export class BarStats extends Indicator {
  name = 'Bar Stats';
  config = {};

  protected _mapGetSettings(settings: any) {
    return settings;
  }

  protected _mapSetSettings(settings: any) {
    return settings;
  }
}
