import { computed, signal } from "@angular/core";

import { IObject, IEntity, Index, ItemType, ObjectRef, ObjectType, Rarity, Tier, isCurrency, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.module";
import { __injector } from "../artisan.service";
import { Composite } from "./composite";
import { Materials } from "./materials";

export function coalesce(value: number | null, fallback: number): number;
export function coalesce(value: number | null, fallback: null): number;
export function coalesce(value: number | null, fallback: number | null): number | null {
  return value != null && !isNaN(value) ? value : fallback;
}

export class Entity implements IEntity {
  readonly #gaming: GamingToolsService = __injector.get(GamingToolsService);
  readonly #owners = signal<Composite[]>([]);
  readonly #item: IObject;

  get id(): string { return this.#item.id; }
  get type(): ObjectType { return this.#item.type; }
  get itemType(): ItemType { return this.#item.itemType; }
  get name(): string { return this.#item.name; }
  get icon(): string | undefined { return this.#item.icon; }
  get tier(): Tier | undefined { return this.#item.tier; }
  get rarity(): Rarity | undefined { return this.#item.rarity; }

  get canBeCrafted(): boolean { return false; }
  get ref(): ObjectRef { return { id: this.id, type: this.type }; }
  get isOwned(): boolean { return this.#owners().length > 0; }

  readonly price = computed(() => this.#gaming.commodities()?.[this.id] ?? null);
  readonly value = computed(() => this.#gaming.commodities()?.[this.id] ?? null);

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
      this.#item = object;
    } else if (isRecipe(object)) {
      const ref = object.output;
      if (ref) {
        const storage = index[ref.type];
        const item = storage && storage[ref.id];
        if (isItem(item)) {
          this.#item = item;;
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

  bind(owner: Composite) {
    this.#owners.update(owners => {
      if (owner) {
        owners.push(owner);
      }
      return owners;
    });
  }

  static isRecipeSupported(id: string, index: Index<IObject>): boolean {
    const storage = index['recipe'];
    const recipe = storage && storage[id];
    return isRecipe(recipe) && recipe.category !== "Material Conversion" && recipe.tradeskill as string !== "";
  }
}
