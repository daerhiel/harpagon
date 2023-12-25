import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from '@environments/environment';
import { buildUrl } from '@app/services/utilities';
import { Response } from './models/response';
import { IItem, IObject, IRecipe, isItem, isRecipe } from './models/objects';
import { ObjectRef, SearchRef } from './models/types';

export type Schema<T> = {
  [K in keyof T]?:
  T[K] extends (infer I)[] ? I extends object ? Schema<I> | boolean : boolean :
  T[K] extends object ? Schema<T[K]> | boolean :
  boolean;
}

function reduce<T, S extends Schema<T>>(value: T, schema: S): T {
  if (value != null) {
    for (const name in value) {
      if (schema[name as keyof S] === false) {
        delete value[name];
      }
    }
  }
  return value;
}

function reduceMap<T extends IObject>(value: T): T {
  if (isItem(value)) {
    return reduce(value, itemSchema as Schema<T & IItem>);
  } else if (isRecipe(value)) {
    return reduce(value, recipeSchema as Schema<T & IRecipe>);
  } else {
    return reduce(value, objectSchema as Schema<T & IObject>);
  }
}

const objectSchema: Schema<IObject> = {
} as const;

const itemSchema: Schema<IItem> = {
  itemClass: false,
  recommendedItems: false,
  recommendedItemsTypeString: false,
  lootTableIds: false,
  drops_salvage: false,
  drops_salvage_from: false,
  drops_lootcontainer_from: false,
  monstersWithDrop: false,
  gatherablesWithItem: false,
  salvageOutput: false,
  upgradeRecipes: false,
  craftingRecipesInput: false,
  craftingRecipesOutput: false,
  questRewards: false,
  questTurnins: false,
} as const;

const recipeSchema: Schema<IRecipe> = {
  bKnownByDefault: false,
  recommendedItems: false,
  recommendedItemsTypeString: false,
  recommendedItemsSet: false,
  recommendedItemsSetTypeString: false,
} as const;

@Injectable({
  providedIn: 'root'
})
export class NwDbApiService {
  readonly #http: HttpClient = inject(HttpClient);
  readonly #url: string = environment.apiNwDbUrl;

  getVersion(): Observable<number> {
    return this.#http.get<{ v: number }>(buildUrl(this.#url, 'version.json')).pipe(map(x => Number(x.v)));
  }

  getObject<T extends IObject>(ref: ObjectRef | null): Observable<T | null> {
    return ref ? this.#http.get<Response<T>>(buildUrl(this.#url, 'db', [ref.type, `${ref.id}.json`])).pipe(map(x => reduceMap(x.data))) : of(null);
  }

  search(term: string): Observable<SearchRef[]> {
    return this.#http.get<Response<SearchRef[]>>(buildUrl(this.#url, 'db', ['search', term])).pipe(map(x => x.data));
  }
}
