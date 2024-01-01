import { Signal, computed, signal } from "@angular/core";

import { IItem, IObject, TradeSkill, isItem } from "@modules/nw-db/nw-db.module";
import { Mutator } from "./mutator";
import { Housing } from "./housing";

export class Equipment extends Mutator {
  readonly #armor: Record<string, IItem> = {};
  readonly #faction: Record<string, IItem> = {};
  readonly #charms: Record<string, IItem> = {};

  readonly level = signal(250);
  readonly head = signal(true);
  readonly chest = signal(true);
  readonly hands = signal(true);
  readonly legs = signal(true);
  readonly feet = signal(true);
  readonly faction = signal(false);
  readonly earring = signal(true);

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

    let bonus = this.base + this.level() / 1000;
    const housing = this.housing();
    if (housing && housing.skill === this.skill) {
      bonus += housing.bonus();
    }
    return bonus + this.getBonus(multipliers);
  });

  get hasArmor(): boolean { return Object.keys(this.#armor).length > 0; }
  get hasFaction(): boolean { return Object.keys(this.#faction).length > 0; }
  get hasCharms(): boolean { return Object.keys(this.#charms).length > 0; }

  constructor(private readonly housing: Signal<Housing | undefined>, skill: TradeSkill, readonly base: number, ...objects: IObject[]) {
    super(skill, ...objects);
    for (const object of objects) {
      if (isItem(object)) {
        if (['Armor', 'armor'].includes(object.itemType!)) {
          if (object.tier && object.tier >= 4) {
            const perk = this.getPerk(object.perks[0]?.id);
            if (!perk || perk.itemsWithPerk.length > 1) {
              if (object.perks.length === 1) {
                this.#armor[object.typeName] = object;
              }
            } else {
              this.#faction[object.typeName] = object;
            }
          }
        } else if (['Resource', 'resource'].includes(object.itemType!)) {
          this.#charms[object.id] = object;
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
