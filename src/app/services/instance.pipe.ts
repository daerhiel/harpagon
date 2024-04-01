import { Pipe, PipeTransform, Type } from '@angular/core';

@Pipe({
  name: 'instance',
  standalone: true
})
export class InstancePipe implements PipeTransform {
  transform<T>(value: unknown, target: Type<T>): value is T {
    return value instanceof target;
  }
}
