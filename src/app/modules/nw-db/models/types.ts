export type Tier = 1 | 2 | 3 | 4 | 5 | 100;
export type Rarity = 1 | 2 | 3 | 4 | 5;

export type ObjectType = 'item' | 'recipe' | 'quest' | 'currency' | 'category';

export type ItemType = 'Resource' | 'Weapon';

export type TradeSkill = 'Armoring' | 'Engineering' | 'Weaponsmithing' | 'Leatherworking' | 'Smelting';

export type RecipeCategory = 'Refined Resources' | 'Material Conversion';

export interface IconItem {
  icon?: string;
}

export interface IQuantity {
  id: string;
  type: ObjectType;
  itemType: ItemType;
  quantity: number;
}

export interface ObjectRef {
  id: string;
  type: ObjectType;
}

export interface IObjectBase extends ObjectRef {
  itemType: ItemType;
  name: string;
  icon?: string;
  tier?: Tier;
  rarity?: Rarity;
}

export interface SearchRef extends IObjectBase {
  level?: number;
  gearScore?: number | null;
  recipeLevel: number;
  recipeSkill: TradeSkill;
  searchRank: number;
}

export interface IObject extends IObjectBase {
  id: string;
  type: ObjectType;
  itemType: ItemType;
  name: string;
  icon?: string;
  tier?: Tier;
  rarity?: Rarity;
  gearScore?: number;
  itemClass: string[];
  perks: [
    {
      id: "perkid_stat_roundshield",
      icon: "icons/misc/icon_attribute_arrow",
      type: "Generated"
    }
  ]
}
