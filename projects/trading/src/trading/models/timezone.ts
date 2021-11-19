import { IBaseItem } from 'communication';

export interface ITimezone extends IBaseItem {
  name: string;
  offset: number;
}
