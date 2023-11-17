import { IObject, IObjectBase, IQuantity, RecipeCategory, TradeSkill } from "./types";

export interface IPerk {
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

export interface IPerkSlot {
  perk: IPerk;
  rollWeight: number;
  chanceMod: number;
  chance: number;
  labelRollChance: number;
  perkRollChance: number;
}

export interface IPerkBucket {
  id: string;
  type: "Generated";
  chance: number;
  perks: IPerkSlot[];
  weightTotal: number;
}

export interface IIngredient extends IObjectBase {
  type: 'item';
  quantity: number;
  recipeId?: { id: string };
}

export interface ICategory {
  type: 'category';
  name: string;
  icon: string;
  subIngredients: IIngredient[];
  primary: false;
  quantity: number;
}

export interface IRecipe extends IObject {
  type: 'recipe';
  description: string;
  perkBuckets: IPerkBucket[];
  ingredients: (IIngredient | ICategory)[];
  tradeskill: TradeSkill;
  recipeLevel: number;
  CraftingFee: number;
  category: RecipeCategory;
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
  output: IObject & IQuantity;
  recommendedItems: IObjectBase[];
  recommendedItemsTypeString: string;
  recommendedItemsSet: IObjectBase[];
  recommendedItemsSetTypeString: string;
}

export interface IItem extends IObject {
  type: 'item';
  description: string;
  flagCanBeCrafted: { id: string };
}

export function isRecipe(object: IObjectBase | null | undefined): object is IRecipe {
  return !!object && object.type === 'recipe' && 'ingredients' in object && 'output' in object;
}

export function isItem(object: IObjectBase | null | undefined): object is IItem {
  return !!object && object.type === 'item';
}

export function isCurrency(object: IObjectBase | null | undefined): object is IItem {
  return !!object && object.type === 'currency';
}
