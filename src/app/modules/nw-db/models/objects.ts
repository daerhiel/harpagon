import { ObjectBase, ItemType, ObjectType, TradeSkill, Quantity, ObjectRef } from "./types";

export interface Perk {
  id: string;
  type: "Generated";
  name: string;
  description: string;
  icon: string;
  attributes: [];
  ScalingPerGearScore: number;
  labels: string[];
  labelsString: string;
}

export interface PerkSlot {
  perk: Perk;
  rollWeight: number;
  chanceMod: number;
  chance: number;
  labelRollChance: number;
  perkRollChance: number;
}

export interface PerkBucket {
  id: string;
  type: "Generated";
  chance: number;
  perks: PerkSlot[];
  weightTotal: number;
}

export interface Ingredient {
  id: string;
  type: ObjectType;
  itemType: ItemType;
  name: string;
  rarity: number;
  icon: string;
  quantity: number;
  recipeId: { id: string };
}

export interface Recipe extends ObjectBase {
  description: string;
  perkBuckets: PerkBucket[];
  ingredients: Ingredient[];
  tradeskill: TradeSkill;
  recipeLevel: number;
  CraftingFee: number;
  category: string;
  stations: string[];
  BaseGearScore: number;
  qtyBonus: number;
  recipeExp: number;
  recipeStanding: number;
  flagNotAvailable: boolean;
  bKnownByDefault: boolean;
  bListedByDefault: boolean;
  isRefining: boolean;
  modCount: number;
  isOnGamingTools: boolean;
  output: ObjectBase & Quantity;
  recommendedItems: ObjectRef[];
  recommendedItemsTypeString: string;
  recommendedItemsSet: ObjectRef[];
  recommendedItemsSetTypeString: string;
}
