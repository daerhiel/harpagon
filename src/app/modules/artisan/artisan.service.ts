import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, expand, filter, from, last, map, mergeMap, of, switchMap, tap, toArray } from 'rxjs';

import { NwDbApiService, Recipe } from '@modules/nw-db/nw-db.module';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { ProtocolService } from './protocol.service';
import { Product } from './artisan.module';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #protocol: ProtocolService = inject(ProtocolService);

  readonly #recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
  readonly recipe = this.#recipe.asReadonly();

  readonly #pipeline = this.#protocol.getLoader(this.#recipe);
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ recipe, index }) => new Product(recipe, index))
  ));

  load(recipe: Recipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe)
  }
}
