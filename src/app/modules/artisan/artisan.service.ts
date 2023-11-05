import { Injectable, computed, inject, signal } from '@angular/core';
import { getStorageItem, setStorageItem } from '@app/services/settings';

import { NwDbApiService, Recipe } from '@modules/nw-db/nw-db.module';
import { Product } from './artisan.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { expand, filter, from, map, mergeMap, switchMap, tap, toArray } from 'rxjs';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

function combine<T, K>(sequence: T[], projection: (value: T) => K[]): K[] {
  return sequence.reduce<K[]>((s, x) => s.concat(projection(x)), []);
}

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);
  readonly #recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
  readonly #recipes: Record<string, Recipe> = {};

  readonly recipe = this.#recipe.asReadonly();

  readonly #pipeline = toObservable(this.#recipe).pipe(
    filter(recipe => !!recipe), map(recipe => [recipe!]),
    expand(recipes => from(combine(recipes, x => x.ingredients.map(x => x.recipeId).filter(x => !!x).map(x => x.id))).pipe(
      filter(id => !(id in this.#recipes)),
      mergeMap(id => this.#nwDbApi.getRecipe(id), 5), toArray(),
    ))
  );

  readonly product = toSignal(this.#pipeline.pipe(map(recipes => new Product(null!))));

  load(recipe: Recipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe)
  }
}
