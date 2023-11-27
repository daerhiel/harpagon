import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'instance',
  standalone: true
})
export class InstancePipe implements PipeTransform {
  transform<T>(value: any, target: abstract new (...args: any[]) => T): value is T {
    return value instanceof target;
  }
}
