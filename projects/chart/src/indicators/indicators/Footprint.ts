import { Indicator } from './Indicator';
import { footprintConfig } from '../fields';

export class Footprint extends Indicator {
  name = 'Footprint';
  config = footprintConfig;

  protected _mapGetSettings(settings: any): any {
    settings.deltaImbalance.threshold *= 100;

    return settings;
  }

  protected _mapSetSettings(settings: any): any {
    settings.deltaImbalance.threshold /= 100;

    return settings;
  }
}
