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
        return 'revs';
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

  // StockCharX periodicity type
  /* static convertToSCXPeriodicy(periodicity) {
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
   }*/

  public static timeFrameToTimeInterval(timeFrame: ITimeFrame) {
    switch (timeFrame.periodicity) {
      case StockChartXPeriodicity.TICK:
        return TimeSpan.MILLISECONDS_IN_MINUTE;
      case StockChartXPeriodicity.VOLUME:
      case StockChartXPeriodicity.REVS:
      case StockChartXPeriodicity.RENKO:
      case StockChartXPeriodicity.RANGE:
        return TimeSpan.MILLISECONDS_IN_HOUR;
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

  public static timeFrameToTimePeriod(timeFrame: ITimeFrame) {
    const today = new Date();
    const prevDay = new Date(today.getTime() - TimeFrame.timeFrameToTimeInterval(timeFrame));
    return calcBusinessDays(prevDay, today) * TimeSpan.MILLISECONDS_IN_DAY;
  }
}

function calcBusinessDays(dDate1, dDate2) {         // input given as Date objects

  let iWeeks, iDateDiff, iAdjust = 0;

  if (dDate2 < dDate1) return -1;                 // error code if dates transposed

  let iWeekday1 = dDate1.getDay();                // day of week
  let iWeekday2 = dDate2.getDay();

  iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1;   // change Sunday from 0 to 7
  iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;

  if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1;  // adjustment if both days on weekend

  iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1;    // only count weekdays
  iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

  // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
  iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000);

  if (iWeekday1 <= iWeekday2) {
    iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1);
  } else {
    iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2);
  }

  iDateDiff -= iAdjust                            // take into account both days on weekend

  return (iDateDiff + 1);                         // add 1 because dates are inclusive

}
