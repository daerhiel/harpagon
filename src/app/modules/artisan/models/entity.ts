import { computed } from "@angular/core";

import { IObject, IEntity, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier, isCurrency, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.module";
import { __injector } from "../artisan.service";
import { Materials } from "./materials";
import { Stage } from "./stage";

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

  get canBeCrafted(): boolean { return false; }
  get ref(): ObjectRef { return { id: this.id, type: this.type }; }

  readonly price = computed(() => this._gaming.commodities()?.[this.id] ?? null);

  constructor(readonly materials: Materials, ref: ObjectRef, index: Index<IObject>) {
    if (!materials) {
      throw new ReferenceError(`The material index is not specified.`);
    }
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

    this.materials.add(this);
  }

  snap(stage: Stage) {
    if (!stage) {
      throw new ReferenceError(`The stage is not specified.`);
    }

    stage.push(this);
  }

  static isRecipeSupported(id: string, index: Index<IObject>): boolean {
    const storage = index['recipe'];
    const recipe = storage && storage[id];
    return isRecipe(recipe) && recipe.category !== "Material Conversion";
  }
}
