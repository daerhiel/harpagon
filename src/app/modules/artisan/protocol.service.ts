import { Injectable, Signal, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, expand, filter, from, last, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { Ingredient, NwDbApiService, Recipe } from "@modules/nw-db/nw-db.module";

export interface RecipeMapping {
  recipe: Recipe;
  index: Record<string, Recipe>;
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolService {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);

  readonly #index: Record<string, Recipe> = {};

  protected cacheAndGet(...recipes: Recipe[]): string[] {
    const ids: string[] = [];

    for (const recipe of recipes) {
      if (recipe) {
        if (!(recipe.id in this.#index)) {
          this.#index[recipe.id] = recipe;
        }

        for (const ingredient of recipe.ingredients) {
          const ref = ingredient.recipeId;
          if (ref && !(ref.id in this.#index) && !ids.includes(ref.id)) {
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
          if (ref && ref.id in this.#index && !(ref.id in index)) {
            const recipe = this.#index[ref.id];
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
