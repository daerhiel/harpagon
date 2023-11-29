import { IIngredient, IObject, Index } from "@modules/nw-db/nw-db.module";
import { Entity } from "./entity";
import { Composite } from "./composite";
import { Ingredient } from "./ingredient";
import { Stage } from "./stage";

export class Materials {
  readonly #index: Record<string, Entity> = {};

  readonly stages: Record<string, Stage> = {};
  readonly product: Stage = new Stage(this, 'product');

  get(id: string): Entity | undefined {
    if (!id) {
      throw new ReferenceError(`The object id is not specified.`);
    }

    return this.#index[id];
  }

  add(entity: Entity): void {
    if (!entity) {
      throw new ReferenceError(`The object entity is not specified.`);
    }

    const id = entity.id;
    if (!this.#index[id]) {
      this.#index[id] = entity;
    } else if (this.#index[id] !== entity) {
      throw new ReferenceError(`The object is already indexed: ${id}.`);
    }
  }

  getStage(entity: Entity): Stage | undefined {
    return Object.keys(this.stages).map(x => this.stages[x]).find(x => x.has(entity));
  }

  createAndLink(parent: Composite, ingredient: IIngredient, index: Index<IObject>): Ingredient {
    if (!parent) {
      throw new ReferenceError(`The parent object entity is not specified.`);
    }
    if (!ingredient) {
      throw new ReferenceError(`The ingredient is not specified.`);
    }
    if (!index) {
      throw new ReferenceError(`The object index is not specified.`);
    }

    let entity = this.#index[ingredient.id];
    if (!entity) {
      const recipeId = ingredient.recipeId;
      if (recipeId && Entity.isRecipeSupported(recipeId.id, index)) {
        entity = new Composite(this, ingredient, index);
      } else {
        entity = new Entity(this, ingredient, index);
      }
    }

    return new Ingredient(parent, ingredient, entity);
  }
}
