import { computed, signal } from "@angular/core";

import { IItem, IObject, TradeSkill, isItem } from "@modules/nw-db/nw-db.module";
import { Mutator, MutatorBlock } from "./mutator";

type HousingBlock = 'house1' | 'house2' | 'house3';

export class Housing extends Mutator<HousingBlock> {
  private static readonly _house1: MutatorBlock<HousingBlock> = { id: 'house1', name: 'House 1' };
  private static readonly _house2: MutatorBlock<HousingBlock> = { id: 'house2', name: 'House 2' };
  private static readonly _house3: MutatorBlock<HousingBlock> = { id: 'house3', name: 'House 3' };

  readonly #trophy: Record<string, IItem> = {};

  readonly trophy1 = signal(true);
  readonly trophy2 = signal(true);
  readonly trophy3 = signal(true);

  readonly bonus = computed(() => {
    const multipliers: Record<string, number> = {};

    this.trophy1() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);
    this.trophy2() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);
    this.trophy3() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);

    return this.getBonus(multipliers);
  });

  constructor(skill: TradeSkill, ...objects: IObject[]) {
    super(skill, ...objects);
    for (const object of objects) {
      if (isItem(object)) {
        if (['HousingItem', 'housingitem'].includes(object.itemType!)) {
          this.#trophy[object.id] = object;
          this.addBlock(Housing._house1);
          this.addBlock(Housing._house2);
          this.addBlock(Housing._house3);
        }
      }
    }
  }

  getCraftingTrophy(): IItem {
    return this.#trophy['house_housingitem_buff_uber_crafting'] ?? null;
  }

  setState(value: ReturnType<typeof this.getState>): void {
    if (value) {
      this.trophy1.set(value.trophy1);
      this.trophy2.set(value.trophy2);
      this.trophy3.set(value.trophy3);
    }
  }

  getState() {
    return {
      trophy1: this.trophy1(),
      trophy2: this.trophy2(),
      trophy3: this.trophy3()
    }
  }
}
