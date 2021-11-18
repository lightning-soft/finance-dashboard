import { Pipe, PipeTransform } from '@angular/core';

const periodicityMap = new Map([
  ['t', 't'],
  ['s', 's'],
  ['', 'm'],
  ['h', 'h'],
  ['d', 'D'],
  ['m', 'M'],
  ['y', 'Y'],
  ['w', 'W'],
  ['revs', 'RV'],
  ['r', 'RK'],
  ['range', 'RG'],
  ['v', 'V'],
]);

@Pipe({
  name: 'timeframeTransform'
})
export class TimeframePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]) {
    if (value == null)
      return '';
    return `${value.interval} ${periodicityMap.get(value.periodicity)}`;
  }
}
