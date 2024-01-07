import { computed } from "@angular/core";

import { ICategory, IEntity, IIngredient, IObject, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier, isCategory } from "@modules/nw-db/nw-db.module";
import { product, ratio } from "@app/services/utilities";
import { Entity } from "./entity";
import { Composite } from "./composite";

function compare(a: any, b: any, asc: boolean): number {
  let result = 0;
  if (a != null && b != null) {
    if (a > b) {
      result = 1;
    } else if (a < b) {
      result = -1;
    }
  } else if (a != null) {
    result = 1;
  } else if (b != null) {
    result = -1;
  }
  return result * (asc ? 1 : -1);
}

export class Ingredient implements IEntity {
  readonly #parent: Composite;
  readonly #ingredient: IIngredient;
  readonly #entity: Entity;
  readonly #entities: Record<string, Entity> = {};

  get id(): string { return this.#entity.id; }
  get type(): ObjectType { return this.#entity.type; }
  get itemType(): ItemType | undefined { return this.#entity.itemType; }
  get name(): string { return this.#entity.name; }
  get icon(): string | undefined { return this.#entity.icon; }
  get tier(): Tier | undefined { return this.#entity.tier; }
  get rarity(): Rarity | undefined { return this.#entity.rarity; }
  get quantity(): number { return this.#ingredient.quantity; }
  get bonus(): number | null { return this.#ingredient.qtyBonus ?? null; }

  get parent(): Composite { return this.#parent; }
  get entity(): Entity { return this.#entity; }
  get canBeCrafted(): boolean { return this.#entity.canBeCrafted; }
  get ref(): ObjectRef { return this.#entity.ref; }
  get score(): number { return this.#entity.score; }

  readonly effectiveValue = computed(() => {
    const bonus = this.#parent.extraItemChance();
    if (bonus) {
      const total = product(product(this.#entity.requestedVolume(), this.#entity.effectiveValue()), this.#entity.getRatio(this.#parent));
      return ratio(total, (this.#parent.requestedVolume() * this.quantity));
    }
    return this.#entity.effectiveValue();
  });
  readonly total = computed(() => product(this.effectiveValue(), this.quantity));

  readonly futureClass = computed(() => {
    if (this.#entity instanceof Composite) {
      return this.#entity.isEffective() ? 'mat-accent' : 'mat-warn';
    }
    return null;
  });
  readonly currentClass = computed(() => {
    if (this.#parent.useCraft() && this.#entity instanceof Composite) {
      return this.#entity.isEffective() ? 'mat-accent' : 'mat-warn';
    }
    return null;
  });

  constructor(parent: Composite, ingredient: IIngredient | ICategory, index: Index<IObject>) {
    if (!parent) {
      throw new ReferenceError(`The parent object entity is not specified.`);
    }
    if (!ingredient) {
      throw new ReferenceError(`The ingredient is not specified.`);
    }
    if (!index) {
      throw new ReferenceError(`The object index is not specified.`);
    }

    this.#parent = parent;
    const materials = parent.materials;
    const entities: Entity[] = [];
    if (isCategory(ingredient)) {
      for (const subIngredient of ingredient.subIngredients) {
        entities.push(materials.get(subIngredient, index));
      }
    } else {
      entities.push(materials.get(ingredient, index));
    }

    let entity: Entity | undefined;
    if (isCategory(ingredient)) {
      for (const entity of entities) {
        this.#entities[entity.id] = entity;
      }
      ingredient.subIngredients.sort((a, b) => {
        const valueA = product(a.quantity, this.#entities[a.id].marketPrice());
        const valueB = product(a.quantity, this.#entities[b.id].marketPrice());
        return compare(valueA, valueB, false);
      })
      for (const subIngredient of ingredient.subIngredients) {
        if (!parent.ingredients.some(x => x.id === subIngredient.id)) {
          ingredient = subIngredient;
          entity = this.#entities[ingredient.id];
        }
      }
      if (isCategory(ingredient) || !entity) {
        throw new RangeError(`Unable to bind ingredients`);
      }
    } else {
      entity = entities[0];
    }
    entity.bind(parent);

    this.#ingredient = ingredient;
    this.#entity = entity;
  }
}
