import { computed, signal } from "@angular/core";

import { IItem, IObject, TradeSkill, isItem } from "@modules/nw-db/nw-db.module";
import { Mutator } from "./mutator";

export class Housing extends Mutator {
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
        }
      }
    }
  }
}
