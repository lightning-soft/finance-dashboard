import { IBaseItem, Id } from 'communication';

export interface ISessionWorkingTime {
  beginDay: number;
  beginTime: number;
  endDay: number;
  endTime: number;
}

export interface ISession extends IBaseItem {
  name: string;
  exchange: string;
  timezoneId: Id;
  workingTimesDto: ISessionWorkingTime[];
}
