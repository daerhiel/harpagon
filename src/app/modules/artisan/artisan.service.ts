import { Injectable, inject, signal } from '@angular/core';
import { getStorageItem, setStorageItem } from '@app/services/settings';

import { NwDbApiService, Recipe } from '@modules/nw-db/nw-db.module';
import { Product } from './artisan.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, expand, filter, from, last, map, mergeMap, of, switchMap, tap, toArray } from 'rxjs';
import { Protocol } from './models/protocol';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);
  readonly #recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
  readonly #protocol: Protocol = new Protocol;

  readonly recipe = this.#recipe.asReadonly();

  readonly #pipeline = toObservable(this.#recipe).pipe(
    filter(recipe => !!recipe),
    switchMap(recipe => of(recipe!).pipe(
      map(recipe => this.#protocol.cacheAndGet(recipe)),
      expand(ids => ids.length > 0 ? from(ids).pipe(
        mergeMap(id => this.#nwDbApi.getRecipe(id), 5), toArray(),
        map(recipes => this.#protocol.cacheAndGet(...recipes))
      ) : EMPTY),
      last(), map(() => recipe!)
    ))
  );

  readonly product = toSignal(this.#pipeline.pipe(
    map(recipe => new Product(recipe, this.#protocol))
  ));

  load(recipe: Recipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe)
  }
}
