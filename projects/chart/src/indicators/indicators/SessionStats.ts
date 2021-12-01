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
        strokeColor: line.strokeTheme.strokeColor,
      };
    }

    return {
      general: settings.general,
      font: settings.font,
      lines,
      sessions: {
        rth: settings.rthSessionId,
        eth: settings.ethSessionId,
      },
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
      lines,
      workingTimes: {
        rth: settings.sessions.rth,
        eth: settings.sessions.eth,
      },
      rthSessionId: settings.sessions.rth?.id,
      ethSessionId: settings.sessions.eth?.id,
    };
  }
}
