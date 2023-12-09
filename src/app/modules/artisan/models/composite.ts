import { Signal, computed, signal } from "@angular/core";

import { IObject, IRecipe, Index, ObjectRef, TradeSkill, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { sum } from "@app/services/utilities";
import { Entity, EntityState } from "./entity";
import { Ingredient } from "./ingredient";
import { Materials } from "./materials";

export interface CompositeState extends EntityState {
  expand: boolean;
  ingredients: Record<string, EntityState>;
}

export class Composite extends Entity {
  readonly #recipe: IRecipe;
  private readonly _tradeSkills: TradeSkill[] = ['Weaving', 'Leatherworking', 'Smelting', 'Stonecutting', 'Woodworking'];
  private readonly _tradeSkill = 250;
  private readonly _gearPieces = 5;

  override get canBeCrafted(): boolean { return false; }

  readonly ingredients: Ingredient[] = [];

  readonly useCraft = signal(false);
  readonly useExtraItems = signal(true);
  readonly craftedValue = computed(() => this.ingredients.reduce((s, x) => sum(s, x.total()), null as number | null));
  override readonly effectiveValue = computed(() => this.useCraft() ? this.craftedValue() : this.marketPrice());
  readonly extraItemChance = computed(() => {
    if (this._tradeSkills.includes(this.#recipe.tradeskill)) {
      const bonus = this.ingredients.reduce((s, x) => sum(s, x.bonus ?? 0), 0);
      return Math.max(this._tradeSkill / 1000 + this._gearPieces * 0.02 + this.#recipe.qtyBonus + bonus, 0);
    }
    return null;
  });
  readonly effectiveVolume: Signal<number | null> = computed(() => {
    const bonus = this.extraItemChance();
    if (bonus && this.useExtraItems()) {
      const volume = this.requestedVolume();
      const effect = Math.round(volume / (1 + bonus));
      if (effect !== volume) {
        return effect;
      }
    }
    return null;
  });
  readonly actualVolume = computed(() => this.useExtraItems() ? this.effectiveVolume() ?? this.requestedVolume() : this.requestedVolume());

  readonly isEffective: Signal<boolean> = computed(() => {
    const result = (this.marketPrice() ?? 0) < this.craftedValue()!;
    return this.useCraft() ? !result : result;
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
          this.#recipe = recipe;
        } else if (recipe) {
          throw new ReferenceError(`The crafting ${'recipe'} is not supported: ${ref.id}.`);
        } else {
          throw new ReferenceError(`The crafting ${'recipe'} is not found: ${ref.id}.`);
        }
      } else {
        throw new ReferenceError(`The ${object.type} cannot be crafted: ${object.id}`);
      }
    } else if (isRecipe(object)) {
      this.#recipe = object;
    } else if (object) {
      throw new ReferenceError(`The object ref '${ref.type}' is not supported: ${ref.id}.`);
    } else {
      throw new ReferenceError(`The object ref '${ref.type}' is not found: ${ref.id}.`);
    }

    for (const ingredient of this.#recipe.ingredients) {
      switch (ingredient.type) {
        case 'category':
          for (const subIngredient of ingredient.subIngredients) {
            this.ingredients.push(this.materials.createAndLink(this, subIngredient, index));
            break;
          }
          break;
        default:
          this.ingredients.push(this.materials.createAndLink(this, ingredient, index));
          break;
      }
    }

    this.ingredients.sort((a, b) => {
      const ta = a.entity instanceof Composite;
      const tb = b.entity instanceof Composite;
      return Number(tb) - Number(ta);
    });
  }

  getIngredient(value: Entity | string): Ingredient | undefined {
    const predicate = value instanceof Entity ?
      (x: Ingredient): boolean => { return x.entity === value; } :
      (x: Ingredient): boolean => { return x.id === value; };
    return this.ingredients.find(predicate);
  }

  toggleCraft(): void {
    this.useCraft.set(!this.useCraft());
  }

  toggleExtraItems(): void {
    this.useExtraItems.set(!this.useExtraItems());
  }

  override getState(): CompositeState {
    const ingredients: Record<string, EntityState> = {};

    for (const ingredient of this.ingredients) {
      ingredients[ingredient.id] = ingredient.entity.getState();
    }

    return {
      ...super.getState(),
      expand: this.useCraft(),
      ingredients
    };
  }

  override setState(state: CompositeState) {
    super.setState(state);
    this.useCraft.set(state.expand);

    if (state) {
      for (const id in state.ingredients) {
        const ingredient = this.ingredients.find(x => x.id === id);
        if (ingredient) {
          ingredient.entity.setState(state.ingredients[id]);
        }
      }
    }
  }
}
