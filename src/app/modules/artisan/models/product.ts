import { Recipe } from "@modules/nw-db/nw-db.module";

import { Protocol } from "./protocol";

export class Product {
  constructor(private readonly _recipe: Recipe, protocol: Protocol) {
    if (!_recipe) {
      throw new ReferenceError(`The recipe is not specified`);
    }

    if (!protocol) {
      throw new ReferenceError(`The protocol is not specified`);
    }

  }
}
