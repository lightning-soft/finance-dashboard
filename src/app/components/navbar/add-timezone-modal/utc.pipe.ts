import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'utc'
})
export class UtcPipe implements PipeTransform {
  transform(value: number, ...args): any {
    return `UTC${value >= 0 ? '+' : ''}${value}`;
  }
}
