import { computed } from "@angular/core";

import { IEntity, IIngredient, IObject, Index, ItemType, ObjectType, Rarity, Tier } from "@app/modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.module";
import { Entity } from "./entity";

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

  readonly price = computed(() => this._gaming.commodities()?.[this.id]);
  readonly cost = computed(() => this.price()! * this.quantity);

  constructor(private readonly _gaming: GamingToolsService, private readonly _ingredient: IIngredient, index: Index<IObject>) {
    this._entity = Entity.fromIngredient(this._gaming, this._ingredient, index);
  }
}
