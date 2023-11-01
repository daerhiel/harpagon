import { Injectable, signal } from '@angular/core';

function getStorageItem<T>(propertyName: string, fallback: T): T {
  try {
    const payload = localStorage.getItem(propertyName);
    if (payload) {
      return JSON.parse(payload);
    }
  } catch {
    localStorage.removeItem(propertyName);
  }
  return fallback;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  static readonly sidenavOpenedName: string = 'layout.sidenav';
  readonly #isSidenavOpen = signal(getStorageItem(LayoutService.sidenavOpenedName, false));
  readonly isSidenavOpen = this.#isSidenavOpen.asReadonly();

  toggleSidenav(isOpen?: boolean) {
    this.#isSidenavOpen.set(isOpen ?? !this.isSidenavOpen());
    localStorage.setItem(LayoutService.sidenavOpenedName, JSON.stringify(this.isSidenavOpen()));
  }
}
