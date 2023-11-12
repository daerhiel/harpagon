export type Tier = 1 | 2 | 3 | 4 | 5 | 100;
export type Rarity = 1 | 2 | 3 | 4 | 5;

export type ObjectType = 'item' | 'recipe' | 'quest' | 'category';

export type ItemType = 'Resource' | 'Weapon';

export type TradeSkill = 'Armoring' | 'Engineering' | 'Weaponsmithing' | 'Leatherworking' | 'Smelting';

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
  type: ObjectType;
}

export interface ObjectBase extends ObjectRef {
  itemType: ItemType;
  name: string;
  icon?: string;
  tier?: Tier;
  rarity?: Rarity;
}

export interface SearchRef extends ObjectBase {
  level?: number;
  gearScore?: number | null;
  recipeLevel: number;
  recipeSkill: TradeSkill;
  searchRank: number;
}

export interface Object extends ObjectBase {
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
  ]
}
