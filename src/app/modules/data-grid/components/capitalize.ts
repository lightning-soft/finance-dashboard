import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'capitalize', pure: true })
export class CapitalizePipe implements PipeTransform {
    transform(value): number {
        return (value || '').capitalize();
    }
}
