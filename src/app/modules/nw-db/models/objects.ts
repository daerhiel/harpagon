import { Object, ObjectBase, Quantity, TradeSkill } from "./types";

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

export interface Ingredient extends ObjectBase {
  type: 'item';
  quantity: number;
  recipeId?: { id: string };
}

export interface Category {
  type: 'category';
  name: string;
  icon: string;
  subIngredients: Ingredient[];
  primary: false;
  quantity: number;
}

export interface Recipe extends Object {
  type: 'recipe';
  description: string;
  perkBuckets: PerkBucket[];
  ingredients: (Ingredient | Category)[];
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
  output: Object & Quantity;
  recommendedItems: ObjectBase[];
  recommendedItemsTypeString: string;
  recommendedItemsSet: ObjectBase[];
  recommendedItemsSetTypeString: string;
}

export interface Item extends Object {
  type: 'item';
  description: string;
  flagCanBeCrafted: { id: string };
}

export function isRecipe(object: ObjectBase | null | undefined): object is Recipe {
  return !!object && object.type === 'recipe' && 'ingredients' in object && 'output' in object;
}

export function isItem(object: ObjectBase | null | undefined): object is Item {
  return !!object && object.type === 'item';
}
