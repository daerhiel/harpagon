import { Recipe } from "@modules/nw-db/nw-db.module";

export class Protocol {
  readonly #index: Record<string, Recipe> = {};

  cacheAndGet(...recipes: Recipe[]): string[] {
    const ids: string[] = [];

    for (const recipe of recipes) {
      if (recipe) {
        if (!(recipe.id in this.#index)) {
          this.#index[recipe.id] = recipe;
        }

        for (const ingredient of recipe.ingredients) {
          const ref = ingredient.recipeId;
          if (ref && !(ref.id in this.#index) && !ids.includes(ref.id)) {
            ids.push(ref.id);
          }
        }
      }
    }

    return ids;
  }
}
