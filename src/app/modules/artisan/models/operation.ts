import { ObjectType, Recipe } from "@modules/nw-db/nw-db.module";

export class Operation {
  readonly operations: Operation[] = [];

  get id(): string { return this._recipe.id; }
  get type(): ObjectType { return this._recipe.type; }
  get icon(): string { return this._recipe.icon; }

  constructor(private readonly _recipe: Recipe, index: Record<string, Recipe>) {
    if (!_recipe) {
      throw new ReferenceError(`The recipe is not specified.`);
    }

    if (!index) {
      throw new ReferenceError(`The index is not specified.`);
    }

    for (const ingredient of _recipe.ingredients) {
      const ref = ingredient.recipeId;
      if (ref && ref.id in index) {
        this.operations.push(new Operation(index[ref.id], index));
      }
    }
  }
}
