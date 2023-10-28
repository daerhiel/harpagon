import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subscriptions } from '@app/services/subscriptions';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule } from '@angular/router';
import { tap } from 'rxjs';

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

  readonly #loadCount = signal(0);
  readonly #isRouteLoading = signal(false);
  #routeDepth: number = 0;

  readonly loadCount = this.#loadCount.asReadonly();
  readonly isRouteLoading = this.#isRouteLoading.asReadonly();

  constructor() {
    this.#subscriptions.subscribe(this.#router.events.pipe(tap(event => {
      if (event instanceof RouteConfigLoadStart) {
        if (++this.#routeDepth === 1) {
          this.#isRouteLoading.set(true);
        }
      } else if (event instanceof RouteConfigLoadEnd) {
        if (this.#routeDepth-- === 1) {
          this.#isRouteLoading.set(false);
          this.#loadCount.update(x => ++x);
        }
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }
}
