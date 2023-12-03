import { computed } from "@angular/core";

import { IEntity, IIngredient, IObject, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier } from "@modules/nw-db/nw-db.module";
import { Entity, coalesce } from "./entity";
import { Composite } from "./composite";

export class Ingredient implements IEntity {
  readonly #parent: Composite;
  readonly #ingredient: IIngredient;
  readonly #entity: Entity;

  get id(): string { return this.#entity.id; }
  get type(): ObjectType { return this.#entity.type; }
  get itemType(): ItemType { return this.#entity.itemType; }
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

  readonly total = computed(() => coalesce(this.#entity.value(), null) * this.quantity);

  constructor(parent: Composite, ingredient: IIngredient, entity: Entity) {
    if (!parent) {
      throw new ReferenceError(`The parent object entity is not specified.`);
    }
    if (!ingredient) {
      throw new ReferenceError(`The ingredient is not specified.`);
    }
    if (!entity) {
      throw new ReferenceError(`The object entity is not specified.`);
    }

    this.#parent = parent;
    this.#ingredient = ingredient;
    this.#entity = entity;
  }
}
