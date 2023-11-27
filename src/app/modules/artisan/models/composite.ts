import { computed } from "@angular/core";

import { IObject, IRecipe, Index, ObjectRef, TradeSkill, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { Entity, coalesce } from "./entity";
import { Ingredient } from "./ingredient";
import { Materials } from "./materials";
import { Stage } from "./stage";

export class Composite extends Entity {
  private readonly _recipe: IRecipe;
  private readonly _tradeSkills: TradeSkill[] = ['Weaving', 'Leatherworking', 'Smelting', 'Stonecutting', 'Woodworking'];
  private readonly _tradeSkill = 250;
  private readonly _gearPieces = 5;

  override get canBeCrafted(): boolean { return false; }

  readonly ingredients: Ingredient[] = [];

  readonly input = computed(() => this.ingredients.reduce((s, x) => s + coalesce(x.total(), 0), 0));
  readonly bonus = computed(() => {
    if (this._tradeSkills.includes(this._recipe.tradeskill)) {
      const bonus = this.ingredients.reduce((s, x) => s + coalesce(x.bonus, 0), 0);
      return Math.max(this._tradeSkill / 1000 + this._gearPieces * 0.02 + this._recipe.qtyBonus + bonus, 0);
    }
    return null;
  });

  constructor(materials: Materials, ref: ObjectRef, index: Index<IObject>) {
    super(materials, ref, index);

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
    } else if (object) {
      throw new ReferenceError(`The object ref '${ref.type}' is not supported: ${ref.id}.`);
    } else {
      throw new ReferenceError(`The object ref '${ref.type}' is not found: ${ref.id}.`);
    }

    for (const ingredient of this._recipe.ingredients) {
      switch (ingredient.type) {
        case 'category':
          for (const subIngredient of ingredient.subIngredients) {
            this.ingredients.push(this.materials.createAndLink(subIngredient, index));
            break;
          }
          break;
        default:
          this.ingredients.push(this.materials.createAndLink(ingredient, index));
          break;
      }
    }
  }

  override snap(stage: Stage): void {
    super.snap(stage)

    for (const ingredient of this.ingredients) {
      ingredient.snap(stage);
    }
  }
}
