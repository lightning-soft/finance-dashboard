import { sessionStatsConfig } from '../fields';
import { Indicator } from './Indicator';

export class SessionStats extends Indicator {
  name = 'Session Stats';
  config = sessionStatsConfig;

  protected _mapGetSettings(settings: any): any {
    const lines = {};

    for (let key in settings.lines) {
      const line = settings.lines[key];

      lines[key] = {
        ...line,
        strokeColor: line.strokeColor,
      };
    }

    return {
      general: settings.general,
      font: settings.font,
      lines,
    };
  }

  protected _mapSetSettings(settings: any): any {
    const lines = {};

    for (let key in settings.lines) {
      const line = settings.lines[key];

      lines[key] = {
        enabled: line.enabled,
        strokeTheme: {
          ...line.strokeTheme,
          strokeColor: line.strokeColor,
        },
        devEnabled: line.devEnabled,
        labelEnabled: line.labelEnabled,
      };
    }

    return {
      general: settings.general,
      font: settings.font,
      workingTimes: settings.workingTimes,
      lines,
    };
  }
}
