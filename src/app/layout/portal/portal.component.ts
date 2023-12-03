import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { tap } from 'rxjs';

import { Subscriptions } from '@app/services/subscriptions';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortalComponent implements OnDestroy {
  readonly #subscriptions = new Subscriptions();
  readonly #router = inject(Router);

  readonly #isRouteLoading = signal(false);
  #routeDepth: number = 0;

  readonly isRouteLoading = this.#isRouteLoading.asReadonly();

  constructor() {
    this.#subscriptions.subscribe(this.#router.events.pipe(tap(event => {
      switch (true) {
        case event instanceof RouteConfigLoadStart:
          if (++this.#routeDepth === 1) {
            this.#isRouteLoading.set(true);
          }
          break;
        case event instanceof RouteConfigLoadEnd:
          if (this.#routeDepth-- === 1) {
            this.#isRouteLoading.set(false);
          }
          break;
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }
}
