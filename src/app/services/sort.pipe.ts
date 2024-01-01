import { Pipe, PipeTransform } from '@angular/core';

function getValue<T>(value: T, path: string[]): any {
  return path.reduce((x, name) => {
    return (x as unknown as Record<string, any>)?.[name];
  }, value);
}

@Pipe({
  name: 'sort',
  standalone: true
})
export class SortPipe implements PipeTransform {
  transform<T>(data: T[] | null | undefined, asc: boolean, ...path: string[]): T[] | null | undefined {
    if (data) {
      data.sort((a, b) => {
        let valueA = getValue(a, path);
        let valueB = getValue(b, path);

        const valueAType = typeof valueA;
        const valueBType = typeof valueB;

        if (valueAType !== valueBType) {
          if (valueAType === 'number') {
            valueA += '';
          }
          if (valueBType === 'number') {
            valueB += '';
          }
        }

        let result = 0;
        if (valueA != null && valueB != null) {
          if (valueA > valueB) {
            result = 1;
          } else if (valueA < valueB) {
            result = -1;
          }
        } else if (valueA != null) {
          result = 1;
        } else if (valueB != null) {
          result = -1;
        }

        return result * (asc ? 1 : -1);
      });
    }
    return data;
  }
}
