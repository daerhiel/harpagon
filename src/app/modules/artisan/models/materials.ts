import { IIngredient, IObject, Index } from "@modules/nw-db/nw-db.module";
import { Entity } from "./entity";
import { Composite } from "./composite";
import { Ingredient } from "./ingredient";
import { Stage } from "./stage";

export class Materials {
  private readonly _index: Record<string, Entity> = {};
  readonly stages: Record<number, Stage> = {};

  get(id: string): Entity | undefined {
    if (!id) {
      throw new ReferenceError(`The object id is not specified.`);
    }

    return this._index[id];
  }

  add(entity: Entity): void {
    if (!entity) {
      throw new ReferenceError(`The object entity is not specified.`);
    }

    const id = entity.id;
    if (!this._index[id]) {
      this._index[id] = entity;
    } else if (this._index[id] !== entity) {
      throw new ReferenceError(`The object is already indexed: ${id}.`);
    }
  }

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
        entity = new Entity(this, ingredient, index);
      }
    }

    return new Ingredient(ingredient, entity);
  }
}
