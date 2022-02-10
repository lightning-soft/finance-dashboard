import { IFormatter } from './formatter';
import * as moment from 'moment';

// const secondsFormat = ':ss';
export class DateTimeFormatter implements IFormatter {
  constructor(public dateFormat: string = 'HH:mm:ss.SSS') {
  }

  // format(value: number): string {
  //   const momentDate = moment(value);
  //   if (this.dateFormat.endsWith(secondsFormat)) {
  //     if (momentDate.milliseconds() >= 500){
  //       momentDate.set('seconds', momentDate.seconds() + 1);
  //     }
  //   }
  //   return momentDate.format(this.dateFormat);
  // }


  format(value: number): string {
    return moment(value).format(this.dateFormat);
  }
}
