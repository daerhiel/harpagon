import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { IconRef } from './nw-db.module';

@Directive({
  selector: 'img[nwIcon]',
  standalone: true
})
export class NwIconDirective {
  readonly #default = 'https://nwdb.info/images/db';
  readonly #cdn = 'https://cdn.nwdb.info/db/images/live/v39';

  @Input()
  set nwIcon(value: IconRef | null | undefined) {
    const element = this._ref.nativeElement;
    if (element && value) {
      let icon = value.icon ?? `${this.#default}/soon.png`;
      const match = /^lyshineui\/images\/(.*)\.png$/.exec(icon);
      if (match?.[1]) {
        icon = match[1].toLocaleLowerCase();
      }
      element.src = `${/^(?:\w+|icons\/filters.*)$/i.test(icon) ? this.#default : this.#cdn}/${icon}.png`;
      if (value.rarity != null) {
        element.classList.forEach(name => {
          if (name.startsWith('item-tier-')) {
            element.classList.remove(name);
          }
        });
        element.classList.add(`item-tier-${value.rarity}`)
      }
    }
  }

  constructor(private readonly _ref: ElementRef<HTMLImageElement>) {
  }

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    const element = this._ref.nativeElement;
    if (element && !element.nonce) {
      element.src = `${this.#default}/soon.png`;
      element.nonce = Math.random().toFixed(20);
    }
  }
}
