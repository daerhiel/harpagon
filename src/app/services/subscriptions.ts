import { Observable, Subscription } from 'rxjs';

export class Subscriptions {
  readonly #subscriptions: Subscription[] = [];

  subscribe<T>(observable: Observable<T>) {
    this.#subscriptions.push(observable.subscribe());
  }

  unsubscribe(): void {
    while (this.#subscriptions.length > 0) {
      this.#subscriptions.shift()?.unsubscribe();
    }
  }
}
