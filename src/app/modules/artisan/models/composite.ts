import { Signal, computed, signal } from "@angular/core";

import { IObject, IRecipe, Index, ItemType, ObjectRef, isItem, isRecipe } from "@modules/nw-db/nw-db.module";
import { product, subtract, sum } from "@app/services/utilities";
import { ArtisanService, __injector } from "../artisan.service";
import { Entity, EntityState } from "./entity";
import { Ingredient, IngredientState } from "./ingredient";
import { Materials } from "./materials";

export interface CompositeState extends EntityState {
  expand: boolean;
  ingredients: Record<string, IngredientState>;
  categories: Record<string, Record<string, IngredientState>>
}

export class Composite extends Entity {
  readonly #artisan: ArtisanService = __injector.get(ArtisanService);
  readonly #recipe: IRecipe;

  private readonly _types: ItemType[] = ['Weapon', 'Armor', 'HousingItem'];

  get recipeId(): string { return this.#recipe.id; }
  get stations(): string[] { return this.#recipe.stations; }

  override get canBeCrafted(): boolean { return false; }
  override get score(): number { return super.score + this.ingredients.reduce((s, x) => s + x.score * 2, 0) + 100; }

  readonly ingredients: Ingredient[] = [];

  readonly useCraft = signal(false);
  readonly useExtraItems = signal(true);
  readonly craftedValue = computed(() => this.ingredients.reduce((s, x) => sum(s, x.total()), null as number | null));
  override readonly effectiveValue = computed(() => this.useCraft() ? this.craftedValue() : this.marketPrice());
  readonly extraItemChance = computed(() => {
    if (!this.#recipe.itemType || !this._types.includes(this.#recipe.itemType)) {
      const bonus = this.ingredients.reduce((s, x) => sum(s, x.bonus ?? 0), 0);
      const equipment = this.#artisan.tradeSkills[this.#recipe.tradeskill]?.();
      if (equipment) {
        return Math.max(equipment.bonus() + this.#recipe.qtyBonus + bonus, 0);
      }
    }
    return null;
  });
  readonly effectiveVolume: Signal<number | null> = computed(() => {
    const bonus = this.extraItemChance();
    if (bonus && this.useExtraItems()) {
      const volume = this.requestedVolume();
      const effect = Math.max(Math.floor(volume / (1 + bonus)), 1);
      if (effect !== volume) {
        return effect;
      }
    }
    return null;
  });
  readonly actualVolume = computed(() => this.useExtraItems() ? this.effectiveVolume() ?? this.requestedVolume() : this.requestedVolume());
  readonly profit = computed(() => {
    const requestedVolume = this.requestedVolume();
    const craftedCost = product(requestedVolume, this.craftedValue());
    const marketCost = product(requestedVolume, this.marketPrice());
    return this.useCraft() ? subtract(marketCost, craftedCost) : subtract(craftedCost, marketCost);
  });

  readonly isEffective: Signal<boolean> = computed(() => {
    const result = (this.marketPrice() ?? 0) < this.craftedValue()!;
    return this.useCraft() ? !result : result;
  });

  readonly profitClass = computed(() => {
    const profit = this.profit();
    if (profit) {
      return profit > 0 ? 'mat-accent' : 'mat-warn';
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
      this.ingredients.push(new Ingredient(this, ingredient, index));
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
    const ingredients: Record<string, IngredientState> = {};
    const categories: Record<string, Record<string, IngredientState>> = {};

    for (const ingredient of this.ingredients) {
      const state = ingredient.getState();
      if (ingredient.category) {
        let category = categories[ingredient.category];
        if (!category) {
          categories[ingredient.category] = category = {};
        }
        category[ingredient.id] = state;
      } else {
        ingredients[ingredient.id] = state;
      }
    }

    return {
      ...super.getState(),
      expand: this.useCraft(),
      ingredients,
      categories
    };
  }

  override setState(state: CompositeState): void {
    super.setState(state);

    if (state) {
      const used: IngredientState[] = [];
      this.useCraft.set(state.expand);

      for (const ingredient of this.ingredients) {
        if (ingredient.category) {
          const category = state.categories[ingredient.category];
          if (category) {
            for (const id in category) {
              const state = category[id];
              if (ingredient.primary === state.primary && !used.includes(state)) {
                ingredient.setState(state);
                used.push(state);
              }
            }
          }
        } else {
          ingredient.setState(state.ingredients[ingredient.id]);
        }
      }
    }
  }

  optimize(): void {
    for (const ingredient of this.ingredients) {
      const entity = ingredient.entity;
      if (entity instanceof Composite) {
        entity.optimize();
      }
    }
    const profit = this.profit();
    if (profit) {
      const current = this.useCraft();
      this.useCraft.set(!current);
      if (this.profit()! < profit) {
        this.useCraft.set(current);
      }
    }
  }
}
