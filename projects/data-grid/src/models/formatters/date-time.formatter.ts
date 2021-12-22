import { IFormatter } from './formatter';
import * as moment from 'moment';

export class DateTimeFormatter implements IFormatter {
  constructor(public dateFormat: string = 'HH:mm:ss.SSS') {
  }

  format(value: number): string {
    return moment(value).format(this.dateFormat);
  }
}
