import { compositeProfileConfig } from '../fields';
import { Indicator } from './Indicator';

export class CompositeProfile extends Indicator {
  name = 'Composite Profile';
  config = compositeProfileConfig;

  protected _mapGetSettings(settings: any): any {
    return {
      general: {
        type: settings.general.type,
        va: settings.general.vaCorrelation * 100,
        align: settings.general.align,
        customTickSize: settings.general.customTickSize,
        width: settings.general.width,
        smoothed: settings.general.smoothed,
      },
      profile: {
        overlayEthOverRth: settings.overlayEthOverRth,
        rth: {
          type: settings.profile.type,
          color: settings.profile.color,
          session: settings.profile.rth?.session,
        },
        eth: {
          type: settings.eth.profile.type,
          color: settings.eth.profile.color,
          session: settings.eth?.session,
        },
      },
      lines: {
        poc: {
          ...settings.lines.current.poc,
          strokeColor: settings.lines.current.poc.strokeTheme.strokeColor,
        },
        va: {
          ...settings.lines.current.va,
          strokeColor: settings.lines.current.va.strokeTheme.strokeColor,
        },
      },
    };
  }

  protected _mapSetSettings(settings: any): any {
    const lines = {
      current: {
        poc: {
          enabled: settings.lines.poc.enabled,
          strokeTheme: {
            ...settings.lines.poc.strokeTheme,
            strokeColor: settings.lines.poc.strokeColor,
          },
          labelEnabled: settings.lines.poc.labelEnabled,
        },
        va: {
          enabled: settings.lines.va.enabled,
          strokeTheme: {
            ...settings.lines.va.strokeTheme,
            strokeColor: settings.lines.va.strokeColor,
          },
          labelEnabled: settings.lines.va.labelEnabled,
        },
      },
    };

    return {
      session: settings.profile.rth.session,
      general: {
        type: settings.general.type,
        vaCorrelation: settings.general.va / 100,
        align: settings.general.align,
        customTickSize: settings.general.customTickSize,
        width: settings.general.width,
        smoothed: settings.general.smoothed,
      },
      profile: {
        type: settings.profile.rth.type,
        color: settings.profile.rth.color,
        rth: settings.profile.rth,
      },
      lines,
      eth: {
        profile: {
          type: settings.profile.eth.type,
          color: settings.profile.eth.color,
        },
        session: settings.profile.eth.session,
        lines,
      },
      overlayEthOverRth: settings.profile.overlayEthOverRth,
    };
  }
}
