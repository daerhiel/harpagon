import { computed, signal } from "@angular/core";
import { IItem, IObject, IPerk, IStatusEffect, TradeSkill, isItem, isPerk, isStatusEffect } from "@modules/nw-db/nw-db.module";

function getBonus(value: string, skill: TradeSkill): (() => number) | null {
  const match = /\+\${(\d+)\s*\*\s*(\w+)\s*\*\s*(\w+)}\s*ROL(\w+)/i.exec(value);
  if (match) {
    const [, roll, property, potency, trade] = match;
    if (skill === trade && !isNaN(Number(roll))) {
      const multiplier = parseInt(roll) / 100 / 100;
      return () => multiplier;
    }
  }
  return null;
}

export class Equipment {
  readonly #armor: Record<string, IItem> = {};
  readonly #faction: Record<string, IItem> = {};
  readonly #perks: Record<string, IPerk> = {};
  readonly #charms: Record<string, IItem> = {};
  readonly #trophy: Record<string, IItem> = {};
  readonly #effects: Record<string, IStatusEffect> = {};
  readonly #bonuses: Record<string, () => number> = {};

  readonly level = signal(250);
  readonly head = signal(true);
  readonly chest = signal(true);
  readonly hands = signal(true);
  readonly legs = signal(true);
  readonly feet = signal(true);
  readonly faction = signal(false);
  readonly earring = signal(true);
  readonly trophy1 = signal(true);
  readonly trophy2 = signal(true);
  readonly trophy3 = signal(true);

  readonly bonus = computed(() => {
    const multipliers: Record<string, number> = {};
    const armor: Record<string, IItem> = {};

    for (const name in this.#armor) {
      if (
        name.includes('Headwear') && this.head() ||
        name.includes('Chestwear') && this.chest() ||
        name.includes('Glove') && this.hands() ||
        name.includes('Legwear') && this.legs() ||
        name.includes('Footwear') && this.feet()
      ) {
        armor[name] = this.#armor[name];
      }
    }
    if (this.faction()) {
      for (const name in this.#faction) {
        armor[name] = this.#faction[name];
      }
    }

    for (const name in armor) {
      this.useItem(armor[name], multipliers);
    }
    if (this.earring()) {
      for (const name in this.#charms) {
        this.useItem(this.#charms[name], multipliers);
      }
    }

    this.trophy1() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);
    this.trophy2() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);
    this.trophy3() && this.useItem(this.#trophy['house_housingitem_buff_uber_crafting'], multipliers);

    let value = this.base + this.level() / 1000;
    for (const bonus in multipliers) {
      if (multipliers[bonus] != null && this.#bonuses[bonus] != null) {
        value += multipliers[bonus] * this.#bonuses[bonus]();
      }
    }
    return value;
  });

  get hasArmor(): boolean { return Object.keys(this.#armor).length > 0; }
  get hasFaction(): boolean { return Object.keys(this.#faction).length > 0; }
  get hasCharms(): boolean { return Object.keys(this.#charms).length > 0; }

  constructor(readonly skill: TradeSkill, readonly base: number, ...objects: IObject[]) {
    for (const object of objects) {
      if (isPerk(object)) {
        this.#perks[object.id] = object;
        for (const effect of object.statusEffects) {
          if (isStatusEffect(effect)) {
            this.#effects[effect.id] = effect;
          }
        }
      }
    }
    for (const object of objects) {
      if (isItem(object)) {
        if (['Armor', 'armor'].includes(object.itemType!)) {
          if (object.tier && object.tier >= 4) {
            const perk = this.#perks[object.perks[0]?.id];
            if (!perk || perk.itemsWithPerk.length > 1) {
              if (object.perks.length === 1) {
                this.#armor[object.typeName] = object;
              }
            } else {
              this.#faction[object.typeName] = object;
            }
          }
        } else {
          if (['Resource', 'resource'].includes(object.itemType!)) {
            this.#charms[object.id] = object;
          } else if (['HousingItem', 'housingitem'].includes(object.itemType!)) {
            this.#trophy[object.id] = object;
          }
          for (const effect of object.statusEffects) {
            if (isStatusEffect(effect)) {
              this.#effects[effect.id] = effect;
            }
          }
        }
      }
    }
    for (const name in this.#effects) {
      const effect = this.#effects[name];
      for (const bonus of effect.bonuses) {
        const formula = getBonus(bonus, skill);
        if (formula) {
          this.#bonuses[effect.id] = formula;
        }
      }
    }
  }

  private useEffect(effect: IStatusEffect, multipliers: Record<string, number>) {
    if (effect && multipliers) {
      const bonus = this.#bonuses[effect.id];
      if (bonus != null) {
        if (multipliers[effect.id] == null) {
          multipliers[effect.id] = 0;
        }
        multipliers[effect.id]++
      }
    }
  }

  private usePerk(perk: IPerk, multipliers: Record<string, number>) {
    if (perk && multipliers) {
      for (const effect of perk.statusEffects) {
        this.useEffect(this.#effects[effect.id], multipliers);
      }
    }
  }

  private useItem(item: IItem, multipliers: Record<string, number>): void {
    if (item && multipliers) {
      if (item.statusEffects) {
        for (const effect of item.statusEffects) {
          this.useEffect(this.#effects[effect.id], multipliers);
        }
      }
      if (item.perks) {
        for (const perk of item.perks) {
          this.usePerk(this.#perks[perk.id], multipliers);
        }
      }
    }
  }

  getHeadwear(): IItem | null {
    return Object.keys(this.#armor).map(x => this.#armor[x]).find(x => x.typeName.includes('Headwear')) ?? null;
  }

  getChestwear(): IItem | null {
    return Object.keys(this.#armor).map(x => this.#armor[x]).find(x => x.typeName.includes('Chestwear')) ?? null;
  }

  getGlove(): IItem | null {
    return Object.keys(this.#armor).map(x => this.#armor[x]).find(x => x.typeName.includes('Glove')) ?? null;
  }

  getLegwear(): IItem | null {
    return Object.keys(this.#armor).map(x => this.#armor[x]).find(x => x.typeName.includes('Legwear')) ?? null;
  }

  getFootwear(): IItem | null {
    return Object.keys(this.#armor).map(x => this.#armor[x]).find(x => x.typeName.includes('Footwear')) ?? null;
  }

  getFaction(): IItem | null {
    return Object.keys(this.#faction).map(x => this.#faction[x]).find(x => x) ?? null;
  }

  getEarring(): IItem | null {
    return Object.keys(this.#charms).map(x => this.#charms[x]).find(x => x) ?? null;
  }
}