import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  static readonly sidenavOpenedName: string = 'layout.sidenav';

  readonly #isSidenavOpen = signal(false);

  readonly isSidenavOpen =  this.#isSidenavOpen.asReadonly();

  constructor() {
    this.#isSidenavOpen.set(JSON.parse(localStorage.getItem(LayoutService.sidenavOpenedName) ?? 'false'));
  }

  toggleSidenav(isOpen?: boolean) {
    this.#isSidenavOpen.set(isOpen ?? !this.isSidenavOpen);
    localStorage.setItem(LayoutService.sidenavOpenedName, JSON.stringify(this.isSidenavOpen));
  }
}
