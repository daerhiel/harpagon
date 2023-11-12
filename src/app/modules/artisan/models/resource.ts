import { Index, Ingredient, ItemType, Object, ObjectBase, ObjectRef, ObjectType, Rarity, Tier, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { Operation } from "./operation";

export class Resource implements ObjectBase {
  private readonly _item: Object;

  get id(): string { return this._item.id; }
  get type(): ObjectType { return this._item.type; }
  get itemType(): ItemType { return this._item.itemType; }
  get name(): string { return this._item.name; }
  get icon(): string { return this._item.icon; }
  get tier(): Tier { return this._item.tier; }
  get rarity(): Rarity { return this._item.rarity; }

  constructor(ref: ObjectRef, index: Index<Object>) {
    if (!ref) {
      throw new ReferenceError(`The object ref is not specified.`);
    }
    if (!index) {
      throw new ReferenceError(`The object index is not specified.`);
    }

    const storage = index[ref.type];
    const object = storage && storage[ref.id];
    if (isItem(object)) {
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
    } else {
      throw new ReferenceError(`The object ref '${ref.type}' is not supported: ${ref.id}.`);
    }
  }

  static fromIngredient(ingredient: Ingredient, index: Index<Object>): Resource {
    if (ingredient.recipeId) {
      return new Operation(ingredient, index);
    } else {
      return new Resource(ingredient, index);
    }
  }
}
