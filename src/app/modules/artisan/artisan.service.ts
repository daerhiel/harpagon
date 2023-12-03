import { Injectable, Injector, OnDestroy, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';

import { NwDbService, IEntity } from '@modules/nw-db/nw-db.module';
import { Subscriptions } from '@app/services/subscriptions';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Product, ProductState } from './artisan.module';

const ENTITY_PROPERTY_NAME = 'artisan.entity';

export var __injector: Injector;

@Injectable({
  providedIn: 'root'
})
export class ArtisanService implements OnDestroy {
  readonly #subscriptions: Subscriptions = new Subscriptions();
  readonly #nwDb: NwDbService = inject(NwDbService);

  readonly #entity = signal(getStorageItem<IEntity | null>(ENTITY_PROPERTY_NAME, null));
  readonly entity = this.#entity.asReadonly();

  readonly #loading = signal(false);
  readonly #pipeline = toObservable(this.#entity).pipe(
    tap(() => this.#loading.set(true)),
    switchMap(ref => this.#nwDb.getHierarchy(ref)),
    tap(() => this.#loading.set(false))
  );

  readonly loading = this.#loading.asReadonly();
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ ref, index }) => {
      let product: Product | null = null;
      if (ref) {
        product = new Product(ref, index);
        const state = getStorageItem<ProductState | null>(`state:${product.id}`, null);
        if (state) {
          product.setState(state);
        }
      }
      return product;
    })
  ));
  readonly #state = computed(() => this.product()?.getState())
  readonly #stream = toObservable(this.#state).pipe();

  constructor(injector: Injector) {
    __injector = injector;
    this.#subscriptions.subscribe(this.#stream.pipe(tap(state => {
      if (state) {
        setStorageItem(`state:${state.id}`, state);
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  load(entity: IEntity): void {
    this.#entity.set(entity);
    setStorageItem(ENTITY_PROPERTY_NAME, entity);
  }
}
