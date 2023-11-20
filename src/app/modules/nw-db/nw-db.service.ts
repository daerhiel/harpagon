import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, from, iif, last, map, mergeMap, of, toArray } from 'rxjs';

import { getStorageItem, setStorageItem } from '@app/services/settings';
import { NwDbApiService } from './nw-db-api.service';
import { IIngredient, isItem, isRecipe } from './models/objects';
import { IObject, ObjectRef, ObjectType } from './models/types';

export type Index<T extends IObject> = Partial<Record<ObjectType, Record<string, T>>>;

export interface Hierarchy<T extends IObject> {
  ref: ObjectRef | null;
  index: Index<T>;
}

@Injectable({
  providedIn: 'root'
})
export class NwDbService {
  readonly #api: NwDbApiService = inject(NwDbApiService);
  private readonly _storage: Index<IObject> = {
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

  constructor() {
    this.loadHierarchy();
  }

  private loadHierarchy(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      switch (true) {
        case key && key.startsWith('object:'): {
          const object = getStorageItem<IObject | null>(key, null);
          if (object) {
            (this._storage[object.type] ?? (this._storage[object.type] = {}))[object.id] = object;
          }
        } break;
      }
    }
  }

  private refOrCached(ref: ObjectRef | null): ObjectRef[] {
    const storage = ref && this._storage[ref.type];
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
      const storage = ref && this._storage[ref.type];
      if ((!storage || !(ref.id in storage)) && !ids.some(x => x.id === ref.id && x.type === ref.type)) {
        ids.push(ref);
      }
    }

    const push = (ingredient: IIngredient): IObject | null => {
      set({ id: ingredient.id, type: ingredient.type });
      const ref = ingredient.recipeId;
      if (ref) {
        set({ id: ref.id, type: 'recipe' });
        return this._storage['recipe']?.[ref.id] ?? null;
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
        const storage = this._storage[object.type];
        if (!storage || !(object.id in storage)) {
          (this._storage[object.type] ?? (this._storage[object.type] = {}))[object.id] = object;
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
        const storage = ref && this._storage[ref.type];
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

  getHierarchy<T extends IObject>(ref: ObjectRef | null): Observable<Hierarchy<T>> {
    return of(ref).pipe(
      mergeMap(ref => iif(() => !!ref, of(this.refOrCached(ref)).pipe(
        expand(ids => ids.length > 0 ? from(ids).pipe(
          mergeMap(id => this.#api.getObject<T>(id), 5), toArray(),
          map(objects => this.cacheAndGet(...objects))
        ) : EMPTY), last(),
        map(() => ({ ref, index: this.buildIndex<T>(ref) }))
      ), of({ ref, index: {} })), 1)
    );
  }
}
