import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, RetryConfig, catchError, expand, from, iif, last, map, mergeMap, of, retry, throwError, timer, toArray } from 'rxjs';

import { BroadcastService } from '@app/services/broadcast.service';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { NwDbApiService } from './nw-db-api.service';
import { IIngredient, IObject, isItem, isRecipe } from './models/objects';
import { ObjectRef, ObjectType, SearchRef } from './models/types';

export type Index<T extends IObject> = Partial<Record<ObjectType, Record<string, T>>>;

export interface Hierarchy<T extends IObject> {
  ref: ObjectRef | null;
  index: Index<T>;
}

@Injectable({
  providedIn: 'root'
})
export class NwDbService {
  readonly #broadcast: BroadcastService = inject(BroadcastService);
  readonly #api: NwDbApiService = inject(NwDbApiService);
  readonly #storage: Index<IObject> = {
    currency: {
      azoth_currency: {
        id: 'azoth_currency',
        type: 'currency',
        name: 'Azoth',
        icon: 'currency_azoth',
        rarity: 2
      } as IObject
    }
  };

  private retryStrategy(config: { delay: number, span: number }): RetryConfig {
    return {
      delay: (e: HttpErrorResponse, count) => {
        if (e.status === 429) {
          const delay = config.delay + Math.random() * config.span * .2 + config.span * count * 0.1;
          return timer(delay);
        }
        return throwError(() => e);
      },
      resetOnSuccess: true
    };
  }

  constructor() {
    this.loadHierarchy();
  }

  private handleError<T>(fallback: T): (e: HttpErrorResponse) => Observable<T> {
    return (e: HttpErrorResponse): Observable<T> => {
      this.#broadcast.exception(e);
      return of(fallback);
    }
  }

  private loadHierarchy(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      switch (true) {
        case key && key.startsWith('object:'): {
          const object = getStorageItem<IObject | null>(key, null);
          if (object) {
            (this.#storage[object.type] ?? (this.#storage[object.type] = {}))[object.id] = object;
          }
        } break;
      }
    }
  }

  private refOrCached(ref: ObjectRef | null): ObjectRef[] {
    const storage = ref && this.#storage[ref.type];
    const object = storage && storage[ref.id];
    if (object) {
      return this.cacheAndGet(object);
    } else if (ref) {
      return [ref];
    } else {
      return [];
    }
  }

  private cacheAndGet<T extends IObject>(...objects: (T | null)[]): ObjectRef[] {
    const ids: ObjectRef[] = [];

    const set = (ref: ObjectRef): void => {
      const storage = ref && this.#storage[ref.type];
      if ((!storage || !(ref.id in storage)) && !ids.some(x => x.id === ref.id && x.type === ref.type)) {
        ids.push(ref);
      }
    }

    const push = (ingredient: IIngredient): IObject | null => {
      set({ id: ingredient.id, type: ingredient.type });
      const ref = ingredient.recipeId;
      if (ref) {
        set({ id: ref.id, type: 'recipe' });
        return this.#storage['recipe']?.[ref.id] ?? null;
      }
      return null;
    }

    const traverse = (object: IObject | null): void => {
      if (isRecipe(object)) {
        const output = object.output;
        set({ id: output.id, type: output.type });
        for (const ingredient of object.ingredients) {
          switch (ingredient.type) {
            case 'category':
              if (object.category !== 'Material Conversion') {
                for (const subIngredient of ingredient.subIngredients) {
                  traverse(push(subIngredient));
                }
              }
              break;
            default:
              traverse(push(ingredient));
              break;
          }
        }
      }
    }

    for (const object of objects) {
      if (object) {
        const storage = this.#storage[object.type];
        if (!storage || !(object.id in storage)) {
          (this.#storage[object.type] ?? (this.#storage[object.type] = {}))[object.id] = object;
          setStorageItem(`object:${object.type}/${object.id}`, object);
        }

        traverse(object);
      }
    }

    return ids;
  }

  private buildIndex<T extends IObject>(ref: ObjectRef | null): Index<T> {
    const index: Index<T> = {};

    if (ref) {
      const get = (ref: ObjectRef): T | null => {
        const storage = ref && this.#storage[ref.type];
        if (storage && ref.id in storage) {
          if (!(ref.type in index) || !(ref.id in index[ref.type]!)) {
            const object = storage[ref.id];
            (index[ref.type] ?? (index[ref.type] = {}))[ref.id] = object as T;
            return object as T;
          }
        }
        return null;
      }

      const traverse = (ref: ObjectRef): void => {
        const object = get(ref);
        if (isItem(object)) {
          if (object.flagCanBeCrafted) {
            traverse({ id: object.flagCanBeCrafted.id, type: 'recipe' });
          }
        } else if (isRecipe(object)) {
          if (object.output) {
            traverse(object.output);
          }
          for (const ingredient of object.ingredients) {
            switch (ingredient.type) {
              case 'category':
                if (object.category !== 'Material Conversion') {
                  for (const subIngredient of ingredient.subIngredients) {
                    traverse(subIngredient);
                  }
                }
                break;
              default:
                traverse(ingredient);
                break;
            }
          }
        }
      }

      traverse(ref);
    }

    return index;
  }

  search(term: string): Observable<SearchRef[]> {
    return this.#api.search(term).pipe(
      retry(this.retryStrategy({ delay: 5000, span: 5000 })),
      catchError(this.handleError([]))
    );
  }

  getHierarchy<T extends IObject>(ref: ObjectRef | null): Observable<Hierarchy<T>> {
    return of(ref).pipe(
      mergeMap(ref => iif(() => !!ref, of(this.refOrCached(ref)).pipe(
        expand(ids => ids.length > 0 ? from(ids).pipe(
          mergeMap(id => this.#api.getObject<T>(id).pipe(
            retry(this.retryStrategy({ delay: 5000, span: 5000 })),
            catchError(this.handleError(null))),
            5),
          toArray(),
          map(objects => this.cacheAndGet(...objects))
        ) : EMPTY), last(),
        map(() => ({ ref, index: this.buildIndex<T>(ref) }))
      ), of({ ref, index: {} })), 1)
    );
  }
}
