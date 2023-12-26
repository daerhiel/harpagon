import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable, ObservableInput, OperatorFunction, ObservedValueOf, Subscriber,
  ReplaySubject,
  timer, of, from, EMPTY, take,
  retry, RetryConfig,
  switchMap, mergeMap,
  tap, map, toArray, expand, last,
  throwError, catchError, filter, reduce
} from 'rxjs';
import { operate } from 'rxjs/internal/util/lift';
import { innerFrom } from 'rxjs/internal/observable/innerFrom';
import { createOperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';

import { BroadcastService } from '@app/services/broadcast.service';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { NwDbApiService } from './nw-db-api.service';
import { IIngredient, IObject, isItem, isPerk, isRecipe } from './models/objects';
import { IEntity, ObjectRef, ObjectType, SearchRef } from './models/types';

export type Index<T extends IObject> = Partial<Record<ObjectType, Record<string, T>>>;

export type Stored<T> = T & {
  _version: number;
};

export interface Hierarchy<T extends IObject> {
  ref: ObjectRef | null;
  index: Index<T>;
}

export function isStored<T>(value: T): value is Stored<T> {
  return value && typeof value === 'object' && '_version' in value;
}

export function getStored<T>(value: T, version: number): Stored<T> {
  return { ...value, _version: version };
}

export function getRefs(selector: (entity: IEntity) => ObjectRef[], ...objects: IEntity[]): ObjectRef[] {
  return objects.reduce<ObjectRef[]>((refs, object) => {
    for (const ref of selector(object)) {
      if (!refs.some(x => x.id === ref.id && x.type === ref.type)) {
        refs.push({ id: ref.id, type: ref.type });
      }
    }
    return refs;
  }, []);
}

export function getPerkItems(ref: IEntity): ObjectRef[] {
  if (isPerk(ref)) {
    return ref.itemsWithPerk;
  }
  return [];
}

export function cacheMap<T extends IObject, O extends ObservableInput<any>>(cache: Index<Stored<IObject>>,
  project: (ref: Stored<ObjectRef>, index: number) => O
): OperatorFunction<Stored<ObjectRef>, ObservedValueOf<O> | Stored<T>> {
  return operate((source, subscriber) => {
    let innerSubscriber: Subscriber<ObservedValueOf<O>> | null = null;
    let index = 0;
    let isComplete = false;

    const checkComplete = () => isComplete && !innerSubscriber && subscriber.complete();
    source.subscribe(createOperatorSubscriber(subscriber, (ref: Stored<ObjectRef>) => {
      innerSubscriber?.unsubscribe();
      const outerIndex = index++;

      const storage = (cache[ref.type] ?? (cache[ref.type] = {}));
      const cachedValue = storage[ref.id];
      if (!cachedValue || cachedValue._version == null || cachedValue._version > 0 && cachedValue._version < ref._version) {
        const inner = project(ref, outerIndex);
        innerFrom(inner).subscribe((innerSubscriber = createOperatorSubscriber(
          subscriber,
          (innerValue: ObservedValueOf<O>) => {
            const object = getStored(innerValue, ref._version);
            setStorageItem<Stored<T>>(`object:${ref.type}/${ref.id}`, object);
            return subscriber.next(storage[ref.id] = innerValue);
          },
          () => { innerSubscriber = null; checkComplete(); }
        )));
      } else {
        subscriber.next(cachedValue as Stored<T>);
        checkComplete();
      }
    }, () => { isComplete = true; checkComplete(); }));
  });
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
  readonly #storage: Index<Stored<IObject>> = {
    currency: {
      azoth_currency: {
        _version: 0,
        id: 'azoth_currency',
        type: 'currency',
        name: 'Azoth',
        icon: 'currency_azoth',
        rarity: 2
      } as Stored<IObject>
    }
  };

  readonly version = toSignal(this.#version);

  private retryStrategy(config: { delay: number, span: number }): RetryConfig {
    return {
      delay: (e: HttpErrorResponse, count) => {
        if (e.status === 429) {
          const delay = config.delay + Math.random() * config.span * .2 + config.span * count * 0.1;
          return timer(delay);
        }
        return throwError(() => e);
      }, resetOnSuccess: true
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
          const object = getStorageItem<Stored<IObject> | null>(key, null);
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
          const value = getStored(object, version);
          (this.#storage[object.type] ?? (this.#storage[object.type] = {}))[object.id] = value;
          setStorageItem<Stored<IObject>>(`object:${object.type}/${object.id}`, value);
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

  getEquipment(...refs: ObjectRef[]): Observable<IObject[]> {
    return from(refs).pipe(mergeMap(ref => this.getObject(ref)), filter(x => !!x), map(x => x!), toArray()).pipe(
      expand(objects => {
        const refs = getRefs(getPerkItems, ...objects);
        return refs.length > 0 ? from(refs).pipe(
          mergeMap(ref => this.getObject(ref), 3), filter(x => !!x), map(x => x!), toArray()
        ) : EMPTY;
      }),
      reduce((objects, value) => objects.concat(value))
    );
  }

  getHierarchy<T extends IObject>(ref: ObjectRef): Observable<Hierarchy<T>> {
    return this.#current.pipe(take(1),
      mergeMap(version => of(this.refOrCached(version, ref)).pipe(
        expand(ids => ids.length > 0 ? from(ids).pipe(
          mergeMap(id => this.#api.getObject<T>(id).pipe(
            retry(this.retryStrategy({ delay: 5000, span: 5000 })),
            catchError(this.handleError(null))),
            3),
          toArray(),
          map(objects => this.cacheAndGet(version, ...objects))
        ) : EMPTY), last(),
        map(() => ({ ref, index: this.buildIndex<T>(ref) }))
      ), 1)
    );
  }

  getObject<T extends IObject>(ref: ObjectRef): Observable<T | null> {
    return this.#current.pipe(take(1),
      map(version => getStored(ref, version)),
      cacheMap<T, Observable<T | null>>(this.#storage, ref => this.#api.getObject<T>(ref).pipe(
        retry(this.retryStrategy({ delay: 5000, span: 5000 })),
        catchError(this.handleError(null))
      ))
    );
  }

  search(term: string): Observable<SearchRef[]> {
    return this.#api.search(term).pipe(
      retry(this.retryStrategy({ delay: 5000, span: 5000 })),
      catchError(this.handleError([]))
    );
  }
}
