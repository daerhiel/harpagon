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

export class Mutator {
  readonly #perks: Record<string, IPerk> = {};
  readonly #effects: Record<string, IStatusEffect> = {};
  readonly #bonuses: Record<string, () => number> = {};

  constructor(readonly skill: TradeSkill, ...objects: IObject[]) {
    for (const object of objects) {
      if (isItem(object) || isPerk(object)) {
        if (isPerk(object)) {
          this.#perks[object.id] = object;
        }
        for (const effect of object.statusEffects) {
          if (isStatusEffect(effect)) {
            this.#effects[effect.id] = effect;
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

  protected useEffect(effect: IStatusEffect, multipliers: Record<string, number>) {
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

  protected usePerk(perk: IPerk, multipliers: Record<string, number>) {
    if (perk && multipliers) {
      for (const effect of perk.statusEffects) {
        this.useEffect(this.#effects[effect.id], multipliers);
      }
    }
  }

  protected useItem(item: IItem, multipliers: Record<string, number>): void {
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

  public getPerk(id: string): IPerk | null {
    return this.#perks[id] ?? null;
  }

  public getBonus(multipliers: Record<string, number>): number {
    let value = 0;
    for (const bonus in multipliers) {
      if (multipliers[bonus] != null && this.#bonuses[bonus] != null) {
        value += multipliers[bonus] * this.#bonuses[bonus]();
      }
    }
    return value;
  }
}
