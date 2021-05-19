import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precision',
})
export class PrecisionPipe implements PipeTransform {
  transform(value: number, precision: number): any {
    return Number(value).toFixed(precision);
  }
}
