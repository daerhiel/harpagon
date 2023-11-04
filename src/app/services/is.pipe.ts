import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'is',
  standalone: true
})
export class IsPipe implements PipeTransform {
  transform<T>(value: T, fallback : T): Exclude<T, string> {
    if (value != null && typeof value === 'object') {
      return value as Exclude<T, string>;
    }
    return fallback as Exclude<T, string>;
  }
}
