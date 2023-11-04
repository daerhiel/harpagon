import { Pipe, PipeTransform } from '@angular/core';

import { IconItem } from './models/base-item';

@Pipe({
  name: 'nwIcon',
  standalone: true
})
export class NwIconPipe implements PipeTransform {
  readonly #cdn = 'https://cdn.nwdb.info/db/images/live/v39';
  readonly #host = 'https://nwdb.info';

  transform(value: IconItem): string {
    let icon = value.icon;
    if (icon) {
      const match = /^lyshineui\/images\/(.*)\.png$/.exec(icon);
      if (match?.[1]) {
        icon = match[1].toLocaleLowerCase();
      }
      return `${this.#cdn}/${icon}.png`;
    }
    return `${this.#host}/images/db/soon.png`;
  }
}
