import { priceStatsConfig } from '../fields';
import { Indicator } from './Indicator';

export class PriceStats extends Indicator {
  name = 'Price Stats';
  config = priceStatsConfig;

  protected _mapGetSettings(settings: any): any {
    return {
      general: {
        type: settings.general.type,
        va: settings.general.vaCorrelation * 100,
        align: settings.general.align,
        customTickSize: settings.general.customTickSize,
        sessions: settings.general.sessions,
      },
      profile: {
        overlayEthOverRth: settings.overlayEthOverRth,
        rth: {
          type: settings.profile.type,
          color: settings.profile.color,
          poc: {
            enabled: settings.lines.current.poc.enabled,
            dev: {
              enabled: settings.lines.dev.poc.enabled,
            },
            strokeColor: settings.lines.current.poc.strokeTheme.strokeColor,
          },
          va: {
            enabled: settings.lines.current.va.enabled,
            dev: {
              enabled: settings.lines.dev.va.enabled,
            },
            strokeColor: settings.lines.current.va.strokeTheme.strokeColor,
          },
        },
        eth: {
          type: settings.eth.profile.type,
          color: settings.eth.profile.color,
          poc: {
            enabled: settings.eth.lines.current.poc.enabled,
            dev: {
              enabled: settings.eth.lines.dev.poc.enabled,
            },
            strokeColor: settings.eth.lines.current.poc.strokeTheme.strokeColor,
          },
          va: {
            enabled: settings.eth.lines.current.va.enabled,
            dev: {
              enabled: settings.eth.lines.dev.va.enabled,
            },
            strokeColor: settings.eth.lines.current.va.strokeTheme.strokeColor,
          },
        },
      },
    };
  }

  protected _mapSetSettings(settings: any): any {
    return {
      general: {
        type: settings.general.type,
        vaCorrelation: settings.general.va / 100,
        align: settings.general.align,
        customTickSize: settings.general.customTickSize,
        sessions: settings.general.sessions,
      },
      profile: {
        type: settings.profile.rth.type,
        color: settings.profile.rth.color,
      },
      lines: {
        current: {
          poc: {
            enabled: settings.profile.rth.poc.enabled,
            strokeTheme: {
              strokeColor: settings.profile.rth.poc.strokeColor,
            },
          },
          va: {
            enabled: settings.profile.rth.va.enabled,
            strokeTheme: {
              strokeColor: settings.profile.rth.va.strokeColor,
            },
          },
        },
        dev: {
          poc: {
            enabled: settings.profile.rth.poc.dev.enabled,
            strokeTheme: {
              strokeColor: settings.profile.rth.poc.strokeColor,
            },
          },
          va: {
            enabled: settings.profile.rth.va.dev.enabled,
            strokeTheme: {
              strokeColor: settings.profile.rth.va.strokeColor,
            },
          },
        },
      },
      workingTimes: settings.profile.rth.workingTimes,
      eth: {
        profile: {
          type: settings.profile.eth.type,
          color: settings.profile.eth.color,
        },
        lines: {
          current: {
            poc: {
              enabled: settings.profile.eth.poc.enabled,
              strokeTheme: {
                strokeColor: settings.profile.eth.poc.strokeColor,
              },
            },
            va: {
              enabled: settings.profile.eth.va.enabled,
              strokeTheme: {
                strokeColor: settings.profile.eth.va.strokeColor,
              },
            },
          },
          dev: {
            poc: {
              enabled: settings.profile.eth.poc.dev.enabled,
              strokeTheme: {
                strokeColor: settings.profile.eth.poc.strokeColor,
              },
            },
            va: {
              enabled: settings.profile.eth.va.dev.enabled,
              strokeTheme: {
                strokeColor: settings.profile.eth.va.strokeColor,
              },
            },
          },
        },
        workingTimes: settings.profile.eth.workingTimes,
      },
      overlayEthOverRth: settings.profile.overlayEthOverRth,
    };
  }
}
