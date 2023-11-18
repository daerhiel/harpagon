import { IObject, IRecipe, Index, ObjectRef, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.module";

import { Entity } from "./entity";
import { Ingredient } from "./ingredient";

export class Composite extends Entity {
  private readonly _recipe: IRecipe;
  readonly ingredients: Ingredient[] = [];

  constructor(private readonly _gaming: GamingToolsService, ref: ObjectRef, index: Index<IObject>) {
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
            this.ingredients.push(new Ingredient(this._gaming, subIngredient, index));
            break;
          }
          break;
        default:
          this.ingredients.push(new Ingredient(this._gaming, ingredient, index));
          break;
      }
    }
  }
}
