import { Injectable, Signal, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, expand, filter, from, last, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { Ingredient, NwDbApiService, Recipe } from "@modules/nw-db/nw-db.module";
import { getStorageItem, setStorageItem } from '@app/services/settings';

export interface RecipeMapping {
  recipe: Recipe;
  index: Record<string, Recipe>;
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolService {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);

  readonly #recipes: Record<string, Recipe> = {};

  constructor() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('recipe:')) {
        const recipe = getStorageItem<Recipe | null>(key, null);
        if (recipe) {
          this.#recipes[recipe.id] = recipe;
        }
      }
    }
  }

  protected cacheAndGet(...recipes: Recipe[]): string[] {
    const ids: string[] = [];

    for (const recipe of recipes) {
      if (recipe) {
        if (!(recipe.id in this.#recipes)) {
          this.#recipes[recipe.id] = recipe;
          setStorageItem(`recipe:${recipe.id}`, recipe);
        }

        for (const ingredient of recipe.ingredients) {
          const ref = ingredient.recipeId;
          if (ref && !(ref.id in this.#recipes) && !ids.includes(ref.id)) {
            ids.push(ref.id);
          }
        }
      }
    }

    return ids;
  }

  getLoader(signal: Signal<Recipe | null>): Observable<RecipeMapping> {
    return toObservable(signal).pipe(
      filter(recipe => !!recipe), map(recipe => recipe!),
      switchMap(recipe => of(recipe).pipe(
        map(recipe => this.cacheAndGet(recipe)),
        expand(ids => ids.length > 0 ? from(ids).pipe(
          mergeMap(id => this.#nwDbApi.getRecipe(id), 5), toArray(),
          map(recipes => this.cacheAndGet(...recipes))
        ) : EMPTY),
        last(), map(() => ({ recipe, index: this.buildIndex(recipe) }))
      ))
    );
  }

  buildIndex(recipe: Recipe | null): Record<string, Recipe> {
    const index: Record<string, Recipe> = {};

    if (recipe) {
      const indexer = (ingredients: Ingredient[]) => {
        for (const ingredient of ingredients) {
          const ref = ingredient.recipeId;
          if (ref && ref.id in this.#recipes && !(ref.id in index)) {
            const recipe = this.#recipes[ref.id];
            index[ref.id] = recipe;
            indexer(recipe.ingredients);
          }
        }
      };
      indexer(recipe.ingredients);
    }

    return index;
  }
}
