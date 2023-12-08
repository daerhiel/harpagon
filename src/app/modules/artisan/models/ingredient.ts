import { Signal, computed } from "@angular/core";

import { IEntity, IIngredient, ItemType, ObjectRef, ObjectType, Rarity, Tier } from "@modules/nw-db/nw-db.module";
import { coalesce, product } from "@app/services/utilities";
import { Entity } from "./entity";
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

  readonly value = computed(() => coalesce(this.#entity.value(), null));
  readonly total = computed(() => product(this.#entity.value(), this.quantity));

  readonly futureClass = computed(() => {
    if (this.#entity instanceof Composite) {
      return this.#entity.isEffective() ? 'mat-accent' : 'mat-warn';
    }
    return null;
  });
  readonly currentClass = computed(() => {
    if (this.#parent.expand() && this.#entity instanceof Composite) {
      return this.#entity.isEffective() ? 'mat-accent' : 'mat-warn';
    }
    return null;
  });

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
