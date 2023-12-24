import { Injectable, Signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  EMPTY, Observable, ReplaySubject, RetryConfig,
  catchError, combineLatest, distinctUntilChanged,
  expand, from, iif, last, map, mergeMap, of, retry, switchMap, take, tap, throwError, timer, toArray
} from 'rxjs';

import { BroadcastService } from '@app/services/broadcast.service';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { NwDbApiService } from './nw-db-api.service';
import { IIngredient, IObject, isItem, isRecipe } from './models/objects';
import { ObjectRef, ObjectType, SearchRef, TradeSkill } from './models/types';
import { toSignal } from '@angular/core/rxjs-interop';
import { Equipment } from '../artisan/models/equipment';

export type Index<T extends IObject> = Partial<Record<ObjectType, Record<string, T>>>;

export interface IVersion {
  _version: number;
}

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
  readonly #version = timer(0, 60 * 60 * 1000).pipe(
    switchMap(() => this.#api.getVersion()),
    tap(version => this.#current.next(version))
  );
  readonly #current = new ReplaySubject<number>(1);
  readonly #storage: Index<IObject & IVersion> = {
    currency: {
      azoth_currency: {
        _version: 0,
        id: 'azoth_currency',
        type: 'currency',
        name: 'Azoth',
        icon: 'currency_azoth',
        rarity: 2
      } as IObject & IVersion
    }
  };
  readonly #cooking: ObjectRef[] = [
    { id: 'perkid_armor_cook', type: 'perk' },
    { id: 'perkid_earring_cook', type: 'perk' },
    { id: 'perkid_armor_cook_faction', type: 'perk' },
    { id: 'house_housingitem_buff_uber_crafting', type: 'item' }
  ];
  readonly #cookingPipeline = this.#current.pipe(distinctUntilChanged(), switchMap(version =>
    combineLatest(this.#cooking.map(ref =>
      this.#api.getObject(ref).pipe(catchError(this.handleError(null)))
    )).pipe(map(objects => new Equipment('Cooking', ...objects.filter(x => !!x).map(x => x!))))
  ));

  readonly cooking = toSignal(this.#cookingPipeline);
  readonly version = toSignal(this.#version);

  readonly tradeSkills: Partial<Record<TradeSkill, Signal<Equipment | undefined>>> = {
    Cooking: this.cooking,
  } as const;

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
          const object = getStorageItem<(IObject & IVersion) | null>(key, null);
          if (object) {
            (this.#storage[object.type] ?? (this.#storage[object.type] = {}))[object.id] = object;
          }
        } break;
      }
    }
  }

  private refOrCached(version: number, ref: ObjectRef | null): ObjectRef[] {
    const storage = ref && this.#storage[ref.type];
    const object = storage && storage[ref.id];
    if (object) {
      return this.cacheAndGet(version, object);
    } else if (ref) {
      return [ref];
    } else {
      return [];
    }
  }

  private cacheAndGet<T extends IObject>(version: number, ...objects: (T | null)[]): ObjectRef[] {
    const ids: ObjectRef[] = [];

    const expired = (ref: ObjectRef): boolean => {
      const storage = ref && this.#storage[ref.type];
      return !storage || !(ref.id in storage) || storage[ref.id]._version == null || (
        storage[ref.id]._version > 0 && storage[ref.id]._version < version
      );
    }

    const set = (ref: ObjectRef): void => {
      if (expired(ref) && !ids.some(x => x.id === ref.id && x.type === ref.type)) {
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
        if (expired(object)) {
          const value: IObject & IVersion = { ...object, _version: version };
          (this.#storage[object.type] ?? (this.#storage[object.type] = {}))[object.id] = value;
          setStorageItem<IObject & IVersion>(`object:${object.type}/${object.id}`, value);
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
            (index[ref.type] ?? (index[ref.type] = {}))[ref.id] = object as IObject as T;
            return object as IObject as T;
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

  getHierarchy<T extends IObject>(ref: ObjectRef | null): Observable<Hierarchy<T>> {
    return this.#current.pipe(
      take(1),
      mergeMap(version => iif(() => !!ref, of(this.refOrCached(version, ref)).pipe(
        expand(ids => ids.length > 0 ? from(ids).pipe(
          mergeMap(id => this.#api.getObject<T>(id).pipe(
            retry(this.retryStrategy({ delay: 5000, span: 5000 })),
            catchError(this.handleError(null))),
            3),
          toArray(),
          map(objects => this.cacheAndGet(version, ...objects))
        ) : EMPTY), last(),
        map(() => ({ ref, index: this.buildIndex<T>(ref) }))
      ), of({ ref, index: {} })), 1)
    );
  }

  search(term: string): Observable<SearchRef[]> {
    return this.#api.search(term).pipe(
      retry(this.retryStrategy({ delay: 5000, span: 5000 })),
      catchError(this.handleError([]))
    );
  }
}
