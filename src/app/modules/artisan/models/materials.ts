import { IIngredient, IObject, Index } from "@modules/nw-db/nw-db.module";
import { Ingredient } from "./ingredient";
import { Entity } from "./entity";
import { Composite } from "./composite";

export class Materials {
  private readonly _index: Record<string, Entity> = {};

  create(ingredient: IIngredient, index: Index<IObject>): Ingredient {
    if (!ingredient) {
      throw new ReferenceError(`The ingredient is not specified.`);
    }
    if (!index) {
      throw new ReferenceError(`The object index is not specified.`);
    }

    let entity = this._index[ingredient.id];
    if (!entity) {
      const recipeId = ingredient.recipeId;
      if (recipeId && Entity.isRecipeSupported(recipeId.id, index)) {
        entity = new Composite(this, ingredient, index);
      } else {
        entity = new Entity(ingredient, index);
      }
      this._index[ingredient.id] = entity;
    }

    return new Ingredient(ingredient, entity);
  }
}
