import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { IEntity } from './nw-db.module';

@Directive({
  selector: 'img[nwIcon]',
  standalone: true
})
export class NwIconDirective {
  readonly #default = 'https://nwdb.info/images/db/soon.png';
  readonly #cdn = 'https://cdn.nwdb.info/db/images/live/v39';

  @Input()
  set nwIcon(value: IEntity | null | undefined) {
    const element = this._ref.nativeElement;
    if (element && value) {
      let icon = value.icon ?? this.#default;
      const match = /^lyshineui\/images\/(.*)\.png$/.exec(icon);
      if (match?.[1]) {
        icon = match[1].toLocaleLowerCase();
      }
      element.src = `${this.#cdn}/${icon}.png`;
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
      element.src = this.#default;
      element.nonce = Math.random().toFixed(20);
    }
  }
}
