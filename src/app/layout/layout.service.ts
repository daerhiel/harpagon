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

function setStorageItem<T>(propertyName: string, value: T): T {
  try {
    localStorage.setItem(propertyName, JSON.stringify(value));
  } catch {
    localStorage.removeItem(propertyName);
  }
  return value;
}

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
