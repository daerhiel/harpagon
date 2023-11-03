import { Injectable, signal } from '@angular/core';

import { getStorageItem, setStorageItem } from '@app/services/settings';

export const SIDENAV_OPEN_PROPERTY_NAME = 'layout.sidenav';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  readonly #isSidenavOpen = signal(getStorageItem(SIDENAV_OPEN_PROPERTY_NAME, false));

  readonly isSidenavOpen = this.#isSidenavOpen.asReadonly();

  toggleSidenav(isOpen?: boolean) {
    this.#isSidenavOpen.set(isOpen ?? !this.isSidenavOpen());
    setStorageItem(SIDENAV_OPEN_PROPERTY_NAME, this.#isSidenavOpen());
  }
}
