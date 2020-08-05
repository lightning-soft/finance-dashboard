import {Periodicity} from 'communication';

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


export class TimeFrame {
  static convertFromSCXPeriodicity(periodicity): Periodicity {
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
  }

  // StockCharX periodicity type
  static convertToSCXPeriodicy(periodicity) {
    switch (periodicity) {
      case Periodicity.Minute:
        return StockChartXPeriodicity.MINUTE;
      case Periodicity.Hour:
        return StockChartXPeriodicity.HOUR;
      case Periodicity.Day:
        return StockChartXPeriodicity.DAY;
      case Periodicity.Week:
        return StockChartXPeriodicity.WEEK;
      case Periodicity.Month:
        return StockChartXPeriodicity.MONTH;
      case Periodicity.Year:
        return StockChartXPeriodicity.YEAR;
    }
  }

  public static timeFrameToTimeInterval(timeFrame: ITimeFrame) {
    switch (timeFrame.periodicity) {
      case StockChartXPeriodicity.TICK:
        return timeFrame.interval;
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
}
