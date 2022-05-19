/*
import {Periodicity} from 'communication';
*/

export interface ITimeFrame {
  interval: number;
  periodicity: string;
}


export const TimeSpan = {
  /** Number of milliseconds in year. */
  MILLISECONDS_IN_YEAR: 31556926000,

  /** number of milliseconds in month. */
  MILLISECONDS_IN_MONTH: 2629743830,

  /** Number of milliseconds in week. */
  MILLISECONDS_IN_WEEK: 604800000,

  /** Number of milliseconds in day. */
  MILLISECONDS_IN_DAY: 86400000,

  /**  Number of milliseconds in hour. */
  MILLISECONDS_IN_HOUR: 3600000,

  /** Number of milliseconds in minute. */
  MILLISECONDS_IN_MINUTE: 60000,

  /** Number of milliseconds in second. */
  MILLISECONDS_IN_SECOND: 1000
};

export const StockChartXPeriodicity = {
  /** Tick. */
  TICK: 't',

  /** Renko */
  RENKO: 'r',

  /** Volume */
  VOLUME: 'v',

  /** Range */
  RANGE: 'range',

  /** REVS */
  REVS: 'revs',

  /** Second. */
  SECOND: 's',

  /** Minute. */
  MINUTE: '',

  /** Hour. */
  HOUR: 'h',

  /** Day. */
  DAY: 'd',

  /** Week. */
  WEEK: 'w',

  /** Month. */
  MONTH: 'm',

  /** Year. */
  YEAR: 'y'
};
export const enumarablePeriodicities = {
  revs: true,
  r: true,
  range: true,
};


export class TimeFrame {
  /*static convertFromSCXPeriodicity(periodicity) {
    switch (periodicity) {
      case StockChartXPeriodicity.SECOND:
        return Periodicity.Second;
      case StockChartXPeriodicity.MINUTE:
        return Periodicity.Minute;
      case StockChartXPeriodicity.HOUR:
        return Periodicity.Hour;
      case StockChartXPeriodicity.DAY:
        return Periodicity.Day;
      case StockChartXPeriodicity.WEEK:
        return Periodicity.Week;
      case StockChartXPeriodicity.MONTH:
        return Periodicity.Month;
      case StockChartXPeriodicity.YEAR:
        return Periodicity.Year;
    }
  }*/

  public static periodicityToString(periodicity: string): string {
    switch (periodicity) {
      case StockChartXPeriodicity.TICK:
        return 'tick';
      case StockChartXPeriodicity.RANGE:
        return 'range';
      case StockChartXPeriodicity.RENKO:
        return 'renko';
      case StockChartXPeriodicity.VOLUME:
        return 'volume';
      case StockChartXPeriodicity.REVS:
        return 'reversal';
      case StockChartXPeriodicity.SECOND:
        return 'second';
      case StockChartXPeriodicity.MINUTE:
        return 'minute';
      case StockChartXPeriodicity.HOUR:
        return 'hour';
      case StockChartXPeriodicity.DAY:
        return 'day';
      case StockChartXPeriodicity.WEEK:
        return 'week';
      case StockChartXPeriodicity.MONTH:
        return 'month';
      case StockChartXPeriodicity.YEAR:
        return 'year';
      default:
        throw new Error(`Unsupported periodicity: ${periodicity}`);
    }
  }

  public static timeFrameToTimeInterval(timeFrame: ITimeFrame): number {
    switch (timeFrame.periodicity) {
      case StockChartXPeriodicity.TICK:
        return TimeSpan.MILLISECONDS_IN_MINUTE;
      case StockChartXPeriodicity.VOLUME:
      case StockChartXPeriodicity.REVS:
      case StockChartXPeriodicity.RENKO:
      case StockChartXPeriodicity.RANGE:
        return TimeSpan.MILLISECONDS_IN_SECOND;
      case StockChartXPeriodicity.SECOND:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_SECOND;
      case StockChartXPeriodicity.MINUTE:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_MINUTE;
      case StockChartXPeriodicity.HOUR:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_HOUR;
      case StockChartXPeriodicity.DAY:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_DAY;
      case StockChartXPeriodicity.WEEK:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_WEEK;
      case StockChartXPeriodicity.MONTH:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_MONTH;
      case StockChartXPeriodicity.YEAR:
        return timeFrame.interval * TimeSpan.MILLISECONDS_IN_YEAR;
      default:
        return 0;
    }
  }

  public static sortTimeFrames(timeFrames: ITimeFrame[]) {
    return timeFrames.sort((a, b) => {
      return transformFrame(a) - transformFrame(b);
    });
  }

}

export function transformFrame(a: ITimeFrame) {
  if ([StockChartXPeriodicity.TICK, StockChartXPeriodicity.RANGE,
    StockChartXPeriodicity.VOLUME,
    StockChartXPeriodicity.REVS, StockChartXPeriodicity.RENKO]) {
    return a.interval;
  }
  TimeFrame.timeFrameToTimeInterval(a);
}
