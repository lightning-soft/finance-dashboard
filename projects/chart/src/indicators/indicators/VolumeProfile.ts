import { Indicator } from './Indicator';
import { volumeProfileConfig } from '../fields';

export class VolumeProfile extends Indicator {
  name = 'Volume Profile';
  config = volumeProfileConfig;

  protected _mapGetSettings(settings: any) {
    settings.general.va = settings.general.vaCorrelation * 100;
    delete settings.general.vaCorrelation;

    [settings, settings.eth].forEach(({ profile, lines }) => {
      profile.width = profile.widthCorrelation * 100;
      delete profile.widthCorrelation;

      Object.assign(
        profile.extendNaked,
        this._mapGetLine(profile.extendNaked.strokeTheme),
      );

      profile.vaInsideOpacity = profile.vaInsideOpacity * 100;
      profile.vaOutsideOpacity = profile.vaOutsideOpacity * 100;

      [lines.current, lines.prev].forEach(item => {
        item.poc = this._mapGetLine(item.poc);
        item.va = this._mapGetLine(item.va);
      });
    });

    return {
      general: settings.general,
      profile: {
        splitProfile: settings.splitProfile,
        overlayEthOverRth: settings.overlayEthOverRth,
        rth: settings.profile,
        eth: settings.eth.profile,
      },
      lines: {
        rth: settings.lines,
        eth: settings.eth.lines,
      },
      graphics: settings.graphics,
    };
  }

  protected _mapSetSettings(settings: any): any {
    settings.general.vaCorrelation = settings.general.va / 100;
    delete settings.general.va;

    [settings.profile.rth, settings.profile.eth].forEach(profile => {
      profile.widthCorrelation = profile.width / 100;
      delete profile.width;

      profile.extendNaked.strokeTheme = this._mapSetLine(profile.extendNaked);
      delete profile.extendNaked.strokeColor;

      profile.vaInsideOpacity = profile.vaInsideOpacity / 100;
      profile.vaOutsideOpacity = profile.vaOutsideOpacity / 100;
    });

    [settings.lines.rth, settings.lines.eth].forEach(lines => {
      [lines.current, lines.prev].forEach(item => {
        item.poc = this._mapSetLine(item.poc);
        item.va = this._mapSetLine(item.va);
      });
    });

    return {
      general: settings.general,
      profile: settings.profile.rth,
      lines: settings.lines.rth,
      graphics: settings.graphics,
      eth: {
        profile: settings.profile.eth,
        lines: settings.lines.eth,
      },
      splitProfile: settings.profile.splitProfile,
      overlayEthOverRth: settings.profile.overlayEthOverRth,
    };
  }

  private _mapGetLine(line: any): any {
    const _line = {
      strokeColor: line.strokeColor,
      strokeTheme: line,
    };

    delete _line.strokeTheme.strokeColor;

    return _line;
  }

  private _mapSetLine(line: any): any {
    return {
      strokeColor: line.strokeColor,
      ...line.strokeTheme,
    };
  }
}
