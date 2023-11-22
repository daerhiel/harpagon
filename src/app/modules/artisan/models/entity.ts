import { computed } from "@angular/core";

import { IIngredient, IObject, IEntity, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier, isCurrency, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.module";
import { __injector } from "../artisan.service";
import { Composite } from "./composite";

export function coalesce(value: number | null, fallback: number): number;
export function coalesce(value: number | null, fallback: null): number;
export function coalesce(value: number | null, fallback: number | null): number | null {
  return value != null && !isNaN(value) ? value : fallback;
}

export class Entity implements IEntity {
  protected readonly _gaming: GamingToolsService = __injector.get(GamingToolsService);

  private readonly _item: IObject;

  get id(): string { return this._item.id; }
  get type(): ObjectType { return this._item.type; }
  get itemType(): ItemType { return this._item.itemType; }
  get name(): string { return this._item.name; }
  get icon(): string | undefined { return this._item.icon; }
  get tier(): Tier | undefined { return this._item.tier; }
  get rarity(): Rarity | undefined { return this._item.rarity; }

  readonly price = computed(() => this._gaming.commodities()?.[this.id] ?? null);

  constructor(ref: ObjectRef, index: Index<IObject>) {
    if (!ref) {
      throw new ReferenceError(`The object ref is not specified.`);
    }
    if (!index) {
      throw new ReferenceError(`The object index is not specified.`);
    }

    const storage = index[ref.type];
    const object = storage && storage[ref.id];
    if (isItem(object) || isCurrency(object)) {
      this._item = object;
    } else if (isRecipe(object)) {
      const ref = object.output;
      if (ref) {
        const storage = index[ref.type];
        const item = storage && storage[ref.id];
        if (isItem(item)) {
          this._item = item;;
        } else if (item) {
          throw new ReferenceError(`The '${ref.type}' output is not supported: ${ref.id}.`);
        } else {
          throw new ReferenceError(`The '${ref.type}' output is not found: ${ref.id}.`);
        }
      } else {
        throw new ReferenceError(`The ${object.type} does not have an output: ${object.id}`);
      }
    } else if (object) {
      throw new ReferenceError(`The object ref '${ref.type}' is not supported: ${ref.id}.`);
    } else {
      throw new ReferenceError(`The object ref '${ref.type}' is not found: ${ref.id}.`);
    }
  }

  static isRecipeSupported(id: string, index: Index<IObject>): boolean {
    const storage = index['recipe'];
    const recipe = storage && storage[id];
    return isRecipe(recipe) && recipe.category !== "Material Conversion";
  }

  static fromIngredient(ingredient: IIngredient, index: Index<IObject>): Entity {
    const recipeId = ingredient.recipeId;
    if (recipeId && this.isRecipeSupported(recipeId.id, index)) {
      return new Composite(ingredient, index);
    } else {
      return new Entity(ingredient, index);
    }
  }
}
