import { Recipe } from "@app/modules/nw-db/nw-db.module";

export class Product {
  constructor(private readonly _recipe: Recipe) {

  }
}
