import { Pipe, PipeTransform } from '@angular/core';
import { enumarablePeriodicities } from './datafeed/TimeFrame';

const periodicityMap = new Map([
  ['t', 'Tick'],
  ['s', 'Sec'],
  ['', 'Min'],
  ['h', 'Hour'],
  ['d', 'Day'],
  ['m', 'M'],
  ['y', 'Y'],
  ['w', 'W'],
  ['revs', 'Rev'],
  ['r', 'Renko'],
  ['range', 'Range'],
  ['v', 'Vol'],
]);


@Pipe({
  name: 'timeframeTransform'
})
export class TimeframePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]) {
    if (value == null)
      return '';

    let suffix = '';
    if (enumarablePeriodicities[value.periodicity])
      suffix = 't';

    return `${value.interval}${suffix} ${periodicityMap.get(value.periodicity)}`;
  }
}
