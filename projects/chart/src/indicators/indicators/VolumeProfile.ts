import { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldConfig } from 'dynamic-form';
import { volumeProfileConfig } from '../fields';
import { Indicator } from './Indicator';

export class VolumeProfile extends Indicator {
  name = 'Volume Profile';
  config = [
    ...volumeProfileConfig,
    new FieldConfig({
      key: 'test',
      label: 'Test',
      fieldGroupClassName: 'd-grid two-rows inline-fields hide-border-bottom regular-label p-x-10',
      fieldGroup: [
      {
        key: 'name',
        type: 'input',
        templateOptions: {
          label: 'Name (required)',
          required: true,
        },
      },
      {
        key: 'age',
        type: 'input',
        templateOptions: {
          label: 'Age (min= 18, max= 40)',
          type: 'number',
          min: 18,
          max: 40,
          required: true,
        },
      },
      {
        key: 'password',
        type: 'input',
        templateOptions: {
          label: 'Password (minLength = 6)',
          type: 'password',
          required: true,
          minLength: 6,
        },
      },
      {
        key: 'comment',
        type: 'textarea',
        templateOptions: {
          label: 'Comment (maxLength = 100)',
          required: true,
          maxLength: 100,
          rows: 5,
        },
      },
      {
        key: 'ip',
        type: 'input',
        templateOptions: {
          label: 'IP Address (pattern = /(\d{1,3}\.){3}\d{1,3}/)',
          pattern: /(\d{1,3}\.){3}\d{1,3}/,
          required: true,
        },
        validation: {
          messages: {
            pattern: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" is not a valid IP Address`,
          },
        },
      },
    ],
  })];

  protected _mapGetSettings(settings: any): any {
    console.log('volumeProfileConfig', volumeProfileConfig);
    return {
      general: {
        period: settings.general.period,
        type: settings.general.type,
        hide: settings.general.hide,
        va: settings.general.vaCorrelation * 100,
        smoothed: settings.general.smoothed,
        align: settings.general.align,
        calculateXProfiles: settings.general.calculateXProfiles,
        customTickSize: settings.general.customTickSize,
      },
      graphics: settings.graphics,
      profile: {
        overlayEthOverRth: settings.overlayEthOverRth,
        splitProfile: settings.splitProfile,
        rth: {
          type: settings.profile.type,
          color: settings.profile.color,
          width: settings.profile.widthCorrelation * 100,
          extendNakedPocs: settings.profile.extendNakedPocs,
          extendNaked: {
            ...settings.profile.extendNaked,
            strokeColor: settings.profile.extendNaked.strokeTheme.strokeColor,
          },
          vaInsideOpacity: settings.profile.vaInsideOpacity * 100,
          vaOutsideOpacity: settings.profile.vaOutsideOpacity * 100,
          session: settings.profile.sessionId,
        },
        eth: {
          type: settings.eth.profile.type,
          color: settings.eth.profile.color,
          width: settings.eth.profile.widthCorrelation * 100,
          extendNakedPocs: settings.eth.profile.extendNakedPocs,
          extendNaked: {
            ...settings.eth.profile.extendNaked,
            strokeColor: settings.eth.profile.extendNaked.strokeTheme.strokeColor,
          },
          vaInsideOpacity: settings.eth.profile.vaInsideOpacity * 100,
          vaOutsideOpacity: settings.eth.profile.vaOutsideOpacity * 100,
          session: settings.eth.profile.sessionId,
        },
      },
      lines: {
        rth: {
          current: {
            poc: {
              ...settings.lines.current.poc,
              strokeColor: settings.lines.current.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.lines.current.va,
              strokeColor: settings.lines.current.va.strokeTheme.strokeColor,
            },
          },
          prev: {
            poc: {
              ...settings.lines.prev.poc,
              strokeColor: settings.lines.prev.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.lines.prev.va,
              strokeColor: settings.lines.prev.va.strokeTheme.strokeColor,
            },
          },
          dev: {
            poc: {
              ...settings.lines.dev.poc,
              strokeColor: settings.lines.dev.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.lines.dev.va,
              strokeColor: settings.lines.dev.va.strokeTheme.strokeColor,
            },
          },
        },
        eth: {
          current: {
            poc: {
              ...settings.eth.lines.current.poc,
              strokeColor: settings.eth.lines.current.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.eth.lines.current.va,
              strokeColor: settings.eth.lines.current.va.strokeTheme.strokeColor,
            },
          },
          prev: {
            poc: {
              ...settings.eth.lines.prev.poc,
              strokeColor: settings.eth.lines.prev.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.eth.lines.prev.va,
              strokeColor: settings.eth.lines.prev.va.strokeTheme.strokeColor,
            },
          },
          dev: {
            poc: {
              ...settings.eth.lines.dev.poc,
              strokeColor: settings.eth.lines.dev.poc.strokeTheme.strokeColor,
            },
            va: {
              ...settings.eth.lines.dev.va,
              strokeColor: settings.eth.lines.dev.va.strokeTheme.strokeColor,
            },
          },
        },
      },
    };
  }

  protected _mapSetSettings(settings: any): any {
    console.log('volumeProfileConfig', volumeProfileConfig);
    return {
      general: {
        period: settings.general.period,
        type: settings.general.type,
        hide: settings.general.hide,
        vaCorrelation: settings.general.va / 100,
        smoothed: settings.general.smoothed,
        align: settings.general.align,
        calculateXProfiles: settings.general.calculateXProfiles,
        customTickSize: settings.general.customTickSize,
      },
      graphics: settings.graphics,
      profile: {
        type: settings.profile.rth.type,
        color: settings.profile.rth.color,
        widthCorrelation: settings.profile.rth.width / 100,
        extendNakedPocs: settings.profile.rth.extendNakedPocs,
        extendNaked: {
          enabled: settings.profile.rth.extendNaked.enabled,
          type: settings.profile.rth.extendNaked.type,
          strokeTheme: {
            ...settings.profile.rth.extendNaked.strokeTheme,
            strokeColor: settings.profile.rth.extendNaked.strokeColor,
          },
        },
        vaInsideOpacity: settings.profile.rth.vaInsideOpacity / 100,
        vaOutsideOpacity: settings.profile.rth.vaOutsideOpacity / 100,
      },
      lines: {
        current: {
          poc: {
            enabled: settings.lines.rth.current.poc.enabled,
            strokeTheme: {
              ...settings.lines.rth.current.poc.strokeTheme,
              strokeColor: settings.lines.rth.current.poc.strokeColor,
            },
          },
          va: {
            enabled: settings.lines.rth.current.va.enabled,
            strokeTheme: {
              ...settings.lines.rth.current.va.strokeTheme,
              strokeColor: settings.lines.rth.current.va.strokeColor,
            },
          },
        },
        prev: {
          poc: {
            enabled: settings.lines.rth.prev.poc.enabled,
            strokeTheme: {
              ...settings.lines.rth.prev.poc.strokeTheme,
              strokeColor: settings.lines.rth.prev.poc.strokeColor,
            },
          },
          va: {
            enabled: settings.lines.rth.prev.va.enabled,
            strokeTheme: {
              ...settings.lines.rth.prev.va.strokeTheme,
              strokeColor: settings.lines.rth.prev.va.strokeColor,
            },
          },
        },
        dev: {
          poc: {
            enabled: settings.lines.rth.dev.poc.enabled,
            strokeTheme: {
              ...settings.lines.rth.dev.poc.strokeTheme,
              strokeColor: settings.lines.rth.dev.poc.strokeColor,
            },
          },
          va: {
            enabled: settings.lines.rth.dev.va.enabled,
            strokeTheme: {
              ...settings.lines.rth.dev.va.strokeTheme,
              strokeColor: settings.lines.rth.dev.va.strokeColor,
            },
          },
        },
      },
      workingTimes: settings.profile.rth.session?.workingTimes,
      sessionId: settings.profile.rth.session?.id,
      eth: {
        profile: {
          type: settings.profile.eth.type,
          color: settings.profile.eth.color,
          widthCorrelation: settings.profile.eth.width / 100,
          extendNakedPocs: settings.profile.eth.extendNakedPocs,
          extendNaked: {
            enabled: settings.profile.eth.extendNaked.enabled,
            type: settings.profile.eth.extendNaked.type,
            strokeTheme: {
              ...settings.profile.eth.extendNaked.strokeTheme,
              strokeColor: settings.profile.eth.extendNaked.strokeColor,
            },
          },
          vaInsideOpacity: settings.profile.eth.vaInsideOpacity / 100,
          vaOutsideOpacity: settings.profile.eth.vaOutsideOpacity / 100,
        },
        lines: {
          current: {
            poc: {
              enabled: settings.lines.eth.current.poc.enabled,
              strokeTheme: {
                ...settings.lines.eth.current.poc.strokeTheme,
                strokeColor: settings.lines.eth.current.poc.strokeColor,
              },
            },
            va: {
              enabled: settings.lines.eth.current.va.enabled,
              strokeTheme: {
                ...settings.lines.eth.current.va.strokeTheme,
                strokeColor: settings.lines.eth.current.va.strokeColor,
              },
            },
          },
          prev: {
            poc: {
              enabled: settings.lines.eth.prev.poc.enabled,
              strokeTheme: {
                ...settings.lines.eth.prev.poc.strokeTheme,
                strokeColor: settings.lines.eth.prev.poc.strokeColor,
              },
            },
            va: {
              enabled: settings.lines.eth.prev.va.enabled,
              strokeTheme: {
                ...settings.lines.eth.prev.va.strokeTheme,
                strokeColor: settings.lines.eth.prev.va.strokeColor,
              },
            },
          },
          dev: {
            poc: {
              enabled: settings.lines.eth.dev.poc.enabled,
              strokeTheme: {
                ...settings.lines.eth.dev.poc.strokeTheme,
                strokeColor: settings.lines.eth.dev.poc.strokeColor,
              },
            },
            va: {
              enabled: settings.lines.eth.dev.va.enabled,
              strokeTheme: {
                ...settings.lines.eth.dev.va.strokeTheme,
                strokeColor: settings.lines.eth.dev.va.strokeColor,
              },
            },
          },
        },
        workingTimes: settings.profile.eth.session?.workingTimes,
        sessionId: settings.profile.eth.session?.id,
      },
      overlayEthOverRth: settings.profile.overlayEthOverRth,
      splitProfile: settings.profile.splitProfile,
    };
  }
}
