import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixedNumber',
})
export class FixedNumberPipe implements PipeTransform {
  transform(value: number, precision = 2): string | null {
    return numberWithCommas(value, precision) ?? '';
  }
}

export function numberWithCommas(value: number, precision: number): string {
  if (value == null || isNaN(value))
    return;

  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
}
