import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utc'
})
export class UtcPipe implements PipeTransform {
  transform(offset: number, ...args): string {
    const integer = Math.trunc(offset);
    let text = `UTC${offset >= 0 ? '+' : ''}${integer}`;

    const minutes = this.getMinutesFromOffset(offset);
    text += `:${minutes ? minutes : '00'}`;

    return text;
  }

  private getMinutesFromOffset(offset: number): number {
    const decimal = offset.toFixed(2).split('.')[1];
    return +decimal * 60 / 100;
  }
}

