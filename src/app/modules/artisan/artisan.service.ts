import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { NwDbService, Recipe } from '@modules/nw-db/nw-db.module';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Product } from './artisan.module';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDb: NwDbService = inject(NwDbService);

  readonly #recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
  readonly recipe = this.#recipe.asReadonly();

  readonly #pipeline = toObservable(this.#recipe).pipe(
    switchMap(recipe => this.#nwDb.getHierarchy(recipe))
  );
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ ref, index }) => ref ? new Product(ref, index) : null)
  ));

  load(recipe: Recipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe);
  }
}
