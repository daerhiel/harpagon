export type Tier = 1 | 2 | 3 | 4 | 5 | 100;
export type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

export type ObjectType = 'item' | 'recipe' | 'quest' | 'currency' | 'category' | 'perk' | 'tradeskill';

export type ItemType = 'Resource' | 'Weapon' | 'Armor' | 'HousingItem';

export type TradeSkill = 'Armoring' | 'Engineering' | 'Weaponsmithing' | 'Arcana' | 'Cooking' | 'Weaving' | 'Leatherworking' | 'Smelting' | 'Stonecutting' | 'Woodworking';

export type RecipeCategory = 'Refined Resources' | 'Material Conversion';

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

export interface IconRef {
  icon?: string;
  rarity?: Rarity;
}

export interface IEntity extends ObjectRef, IconRef {
  itemType?: ItemType;
  name: string;
  icon?: string;
  tier?: Tier;
  rarity?: Rarity;
}

export interface SearchRef extends IEntity {
  level?: number;
  gearScore?: number | null;
  recipeLevel: number;
  recipeSkill: TradeSkill;
  searchRank: number;
}

export function isRef(object: object): object is ObjectRef {
  return object && 'type' in object && 'type' in object;
}

export function isEntity(object: object): object is IEntity {
  return isRef(object) && 'name' in object;
}
