import { volumeProfileConfig } from '../fields';
import { Indicator } from './Indicator';

export class CustomVolumeProfile extends Indicator {
  name = 'Custom Volume Profile';
  config = volumeProfileConfig;

  // protected _mapGetSettings(settings: any): any {
  //   return {

  //   };
  // }

  // protected _mapSetSettings(settings: any): any {
  //   return {

  //   };
  // }
}
