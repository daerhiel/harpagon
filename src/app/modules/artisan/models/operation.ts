import { Index, Item, Object, ObjectRef, Recipe, isItem, isRecipe } from "@modules/nw-db/nw-db.module";

import { Resource } from "./resource";

export class Operation extends Resource {
  private readonly _recipe: Recipe;
  readonly resources: Resource[] = [];

  constructor(ref: ObjectRef, index: Index<Object>) {
    super(ref, index);

    const storage = index[ref.type];
    const object = storage && storage[ref.id];
    if (isItem(object)) {
      const ref = object.flagCanBeCrafted;
      if (ref) {
        const storage = index['recipe'];
        const recipe = storage && storage[ref.id];
        if (isRecipe(recipe)) {
          this._recipe = recipe;
        } else if (recipe) {
          throw new ReferenceError(`The crafting ${'recipe'} is not supported: ${ref.id}.`);
        } else {
          throw new ReferenceError(`The crafting ${'recipe'} is not found: ${ref.id}.`);
        }
      } else {
        throw new ReferenceError(`The ${object.type} cannot be crafted: ${object.id}`);
      }
    } else if (isRecipe(object)) {
      this._recipe = object;
    } else if (object){
      throw new ReferenceError(`The object ref '${ref.type}' is not supported: ${ref.id}.`);
    } else {
      throw new ReferenceError(`The object ref '${ref.type}' is not found: ${ref.id}.`);
    }

    for (const ingredient of this._recipe.ingredients) {
      switch (ingredient.type) {
        case 'category':
          for (const subIngredient of ingredient.subIngredients) {
            this.resources.push(Resource.fromIngredient(subIngredient, index));
            break;
          }
          break;
        default:
          this.resources.push(Resource.fromIngredient(ingredient, index));
          break;
      }
    }
  }
}
