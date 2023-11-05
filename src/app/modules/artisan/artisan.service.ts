import { Injectable, computed, inject, signal } from '@angular/core';
import { getStorageItem, setStorageItem } from '@app/services/settings';

import { NwDbApiService, Recipe } from '@modules/nw-db/nw-db.module';
import { Product } from './artisan.module';
import { toObservable } from '@angular/core/rxjs-interop';
import { expand, from, switchMap, tap } from 'rxjs';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);
  readonly #recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));

  readonly recipe = this.#recipe.asReadonly();
  readonly product = computed(() => {
    const recipe = this.#recipe();
    return recipe ? new Product(recipe) : null;
  });

  readonly pipeline = toObservable(this.#recipe).pipe();
  readonly getArtists = () => from(fetch(url)).pipe(
      switchMap(response => response.json())
  )

  test = this.getArtists().pipe(
   tap(response => rows = rows.concat(response.result)), // on success we concat with the new coming rows
   expand(previousData => previousData.next
              ? getArtists(previousData.next)
              : EMPTY;
   )
  ).subscribe();
  load(recipe: Recipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe)
  }
}
