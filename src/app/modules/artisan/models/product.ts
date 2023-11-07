import { Recipe } from "@modules/nw-db/nw-db.module";

import { Operation } from "./operation";

export class Product extends Operation {
  constructor(_recipe: Recipe, index: Record<string, Recipe>) {
    super(_recipe, index);
  }
}
