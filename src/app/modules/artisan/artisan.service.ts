import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { NwDbService, IRecipe } from '@modules/nw-db/nw-db.module';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Product } from './artisan.module';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Injectable({
  providedIn: 'root'
})
export class ArtisanService {
  readonly #nwDb: NwDbService = inject(NwDbService);

  readonly #recipe = signal<IRecipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
  readonly recipe = this.#recipe.asReadonly();

  readonly #pipeline = toObservable(this.#recipe).pipe(
    switchMap(recipe => this.#nwDb.getHierarchy(recipe))
  );
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ ref, index }) => ref ? new Product(ref, index) : null)
  ));

  load(recipe: IRecipe): void {
    this.#recipe.set(recipe);
    setStorageItem(RECIPE_PROPERTY_NAME, recipe);
  }
}
