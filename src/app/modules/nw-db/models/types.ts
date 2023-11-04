export type Tier = 1 | 2 | 3 | 4 | 5 | 100;
export type Rarity = 1 | 2 | 3 | 4 | 5;

export type ObjectType = 'item' | 'recipe' | 'quest';

export type ItemType = 'Resource' | 'Weapon';

export type TradeSkill = 'Armoring' | 'Engineering' | 'Weaponsmithing';

export interface IconItem {
  icon?: string;
}

export interface Quantity {
  id: string;
  type: ObjectType;
  itemType: ItemType;
  quantity: number;
}

export interface ObjectRef {
  id: string;
  itemType: ItemType;
  name: string;
  icon?: string;
  tier?: Tier;
  rarity?: Rarity;
}

export interface ObjectBase extends ObjectRef {
  id: string;
  type: ObjectType;
  itemType: ItemType;
  name: string;
  icon: string;
  tier: Tier;
  rarity: Rarity;
  gearScore: number;
  itemClass: string[];
  perks: [
    {
      id: "perkid_stat_roundshield",
      icon: "icons/misc/icon_attribute_arrow",
      type: "Generated"
    }
  ],
}
