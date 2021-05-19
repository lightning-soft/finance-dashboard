import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixedNumber',
})
export class FixedNumberPipe implements PipeTransform {
  transform(value: number, precision: number): string {
    return Number(value).toFixed(precision);
  }
}
