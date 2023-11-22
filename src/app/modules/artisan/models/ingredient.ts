import { computed } from "@angular/core";

import { IEntity, IIngredient, IObject, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier } from "@app/modules/nw-db/nw-db.module";
import { Entity, coalesce } from "./entity";
import { Composite } from "./composite";

export class Ingredient implements IEntity {
  private readonly _entity: Entity;

  get id(): string { return this._entity.id; }
  get type(): ObjectType { return this._entity.type; }
  get itemType(): ItemType { return this._entity.itemType; }
  get name(): string { return this._entity.name; }
  get icon(): string | undefined { return this._entity.icon; }
  get tier(): Tier | undefined { return this._entity.tier; }
  get rarity(): Rarity | undefined { return this._entity.rarity; }
  get quantity(): number { return this._ingredient.quantity; }
  get bonus(): number | null { return this._ingredient.qtyBonus ?? null; }

  get canBeCrafted(): boolean { return this._entity instanceof Composite; }
  get ref(): ObjectRef { return { id: this._entity.id, type: this._entity.type }; }

  readonly price = computed(() => this._entity.price());
  readonly total = computed(() => coalesce(this._entity.price(), null) * this.quantity);
  readonly extra = computed(() => this._entity instanceof Composite ? this._entity.bonus() : null);

  constructor(private readonly _ingredient: IIngredient, index: Index<IObject>) {
    this._entity = Entity.fromIngredient(this._ingredient, index);
  }
}
