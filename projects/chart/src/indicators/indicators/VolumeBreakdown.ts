import { Indicator } from './Indicator';
import { volumeBreakdownConfig } from '../fields';

export class VolumeBreakdown extends Indicator {
  name = 'Volume Breakdown';
  config = volumeBreakdownConfig;

  protected _mapGetSettings(settings: any) {
    return {
      general: {
        ...settings.general,
        zeroLine: {
          enabled: settings.general.zeroLine.enabled,
          strokeTheme: settings.general.zeroLine.strokeTheme,
          strokeColor: settings.general.zeroLine.strokeTheme.strokeColor,
        },
      },
      sizeFilter: settings.sizeFilter,
    };
  }

  protected _mapSetSettings(settings: any) {
    return {
      general: {
        ...settings.general,
        zeroLine: {
          enabled: settings.general.zeroLine.enabled,
          strokeColor: settings.general.zeroLine.strokeColor,
          strokeTheme: {
            ...settings.general.zeroLine.strokeTheme,
            strokeColor: settings.general.zeroLine.strokeColor,
          },
        },
      },
      sizeFilter: settings.sizeFilter,
    };
  }
}
