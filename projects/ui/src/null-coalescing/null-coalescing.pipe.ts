import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullCoalescing',
})
export class NullCoalescingPipe implements PipeTransform {

  transform(value: unknown, placeholder = '--'): unknown {
    return value ?? placeholder ;
  }

}
