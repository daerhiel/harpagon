import { computed, signal } from "@angular/core";

import { IIngredient, IObject, Index } from "@modules/nw-db/nw-db.module";
import { Entity } from "./entity";
import { Composite } from "./composite";

function equal(a: Record<string, Entity>, b: Record<string, Entity>): boolean {
  if (a !== b) {
    return false;
  }

  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) {
    return false;
  }

  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) {
      return false;
    }
  }
  for (const key of ka) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export class Materials {
  readonly #index = signal<Record<string, Entity>>({}, { equal });

  readonly stages = computed<Record<string, Entity[]>>(() => {
    const getRoots = (index: Record<string, Entity>): Set<Entity> => {
      const objects = new Set<Entity>();
      for (const id in index) {
        const entity = index[id];
        if (!entity.isOwned) {
          objects.add(entity);
        }
      }
      return objects;
    }

    const stages: Record<string, Set<Entity>> = { product: getRoots(this.#index()) };
    let name = 'product';
    let objects = stages[name];

    while (objects.size > 0) {
      const next = new Set<Entity>();
      for (const entity of objects) {
        if (entity instanceof Composite && entity.useCraft()) {
          for (const ingredient of entity.ingredients) {
            for (const name in stages) {
              stages[name].delete(ingredient.entity);
            }
            next.add(ingredient.entity);
          }
        }
      }
      if (next.size > 0) {
        const [_, id] = /^\w+(?:-(\d+))?$/i.exec(name)!;
        name = `stage-${(id != null ? Number(id) : 0) + 1}`;
        stages[name] = next;
      }
      objects = next;
    }

    const result: Record<string, Entity[]> = {};
    for (const name in stages) {
      result[name] = [...stages[name]].sort((a, b) => {
        const ta = a instanceof Composite;
        const tb = b instanceof Composite;
        return Number(tb) - Number(ta);
      });
    }
    return result;
  });

  get(ingredient: IIngredient, index: Index<IObject>): Entity {
    let entity = this.#index()[ingredient.id];
    if (!entity) {
      const recipeId = ingredient.recipeId;
      if (recipeId && Entity.isRecipeSupported(recipeId.id, index)) {
        entity = new Composite(this, ingredient, index);
      } else {
        entity = new Entity(this, ingredient, index);
      }
    }
    return entity;
  }

  add(entity: Entity): void {
    if (!entity) {
      throw new ReferenceError(`The object entity is not specified.`);
    }

    this.#index.update(index => {
      const value = { ...index };
      const id = entity.id;
      if (!value[id]) {
        value[id] = entity;
      } else if (value[id] !== entity) {
        throw new ReferenceError(`The object is already indexed: ${id}.`);
      }
      return value;
    });
  }
}
