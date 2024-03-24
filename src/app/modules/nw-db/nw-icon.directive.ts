import { Directive, ElementRef, HostListener, effect, inject, input } from '@angular/core';

import { IconRef } from './nw-db.module';

export const imgVersion = 42;
export const nativeHosting = 'https://nwdb.info/images/db';
export const cdnHosting = `https://cdn.nwdb.info/db/images/live/v${imgVersion}`;

@Directive({
  selector: 'img[nwIcon]',
  standalone: true
})
export class NwIconDirective {
  private readonly _ref = inject<ElementRef<HTMLImageElement>>(ElementRef);

  readonly nwIcon = input<IconRef | null>(null);

  protected readonly classList = effect(() => {
    const value = this.nwIcon();
    const element = this._ref.nativeElement;
    if (element) {
      let icon = value?.icon || `soon`;
      const match = /^LyShineUI\/Images\/(.*)\.png$/i.exec(icon);
      if (match?.[1]) {
        icon = match[1].toLocaleLowerCase();
      }
      const native = /^(?:\w+|icons\/filters.*)$/i.test(icon);
      element.src = `${native ? nativeHosting : cdnHosting}/${icon}.png`;
      const rarity = value?.rarity;
      if (rarity != null) {
        element.classList.forEach(name => {
          if (name.startsWith('item-tier-')) {
            element.classList.remove(name);
          }
        });
        element.classList.add(`item-tier-${rarity}`)
      }
    }
  });

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    const element = this._ref.nativeElement;
    if (element && !element.nonce) {
      element.src = `${nativeHosting}/soon.png`;
      element.nonce = Math.random().toFixed(20);
    }
  }
}
