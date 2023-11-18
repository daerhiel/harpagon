import { Injectable, Injector, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

import { NwDbService, IEntity } from '@modules/nw-db/nw-db.module';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Product } from './artisan.module';

const ENTITY_PROPERTY_NAME = 'artisan.entity';

export var __injector: Injector;

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDb: NwDbService = inject(NwDbService);

  readonly #entity = signal(getStorageItem<IEntity | null>(ENTITY_PROPERTY_NAME, null));
  readonly entity = this.#entity.asReadonly();

  readonly #pipeline = toObservable(this.#entity).pipe(
    switchMap(ref => this.#nwDb.getHierarchy(ref))
  );
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ ref, index }) => ref ? new Product(ref, index) : null)
  ));

  constructor(injector: Injector) {
    __injector = injector;
  }

  load(entity: IEntity): void {
    this.#entity.set(entity);
    setStorageItem(ENTITY_PROPERTY_NAME, entity);
  }
}
