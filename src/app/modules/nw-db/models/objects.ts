import { IEntity, IQuantity, RecipeCategory, TradeSkill } from "./types";

export interface IPerk extends IEntity {
  type: "perk";
  perkType: string;
  description: string;
  attributes: [];
  condition: "OnEquip";
  labels: string[];
  labelsString: string;
  statusEffect: IStatusEffect[];
  statusEffects: IStatusEffect[];
  gearScoreMin: number;
  gearScoreMax: number;
  gemsWithPerk: IEntity[];
  itemsWithPerk: IEntity[];
  ScalingPerGearScore: number;
  PreferHigherScaling: boolean;
  ExclusiveLabels: string[];
  AttributeScale: [];
}

export interface IStatusEffect extends IEntity {
  description: string;
  categories: string[];
  maxStack: number;
  duration: number;
  bonuses: string[];
  removeOnDeath: boolean;
  PotencyPerLevel: string;
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

export interface IIngredient extends IEntity {
  type: 'item';
  qtyBonus?: number;
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

export interface IObject extends IEntity {
  gearScore?: number | null;
  itemClass: string[];
  perks: IPerk[],
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
  recommendedItems: IEntity[];
  recommendedItemsTypeString: string;
  recommendedItemsSet: IEntity[];
  recommendedItemsSetTypeString: string;
}

export interface IItem extends IObject {
  type: 'item';
  typeName: string;
  description: string;
  iconHiRes: string;
  perkBuckets: IPerkBucket[];
  gearScoreMin: number | null;
  gearScoreMax: number | null;
  weight: number;
  maxStack: number;
  level: number;
  bindOnPickup: number;
  bindOnEquip: number;
  durability: number;
  namedItem: number;
  refinedAt: string,
  statusEffects: IStatusEffect[];
  flagCanBeCrafted: { id: string };
  flagCraftModMissingPerk: boolean;
  canReplaceGem: number;
  TradingCategory: string;
  idOriginal: string;
  lootTableIds: string[];
  recommendedItems: IEntity[];
  recommendedItemsTypeString: string;
  drops_salvage: IEntity[];
  drops_salvage_from: IEntity[];
  drops_lootcontainer_from: IEntity[];
  monstersWithDrop: IEntity[];
  gatherablesWithItem: any[],
  salvageOutput: any[];
  upgradeRecipes: any[];
  craftingRecipesOutput: IObject[];
  craftingRecipesInput: IObject[];
  IngredientCategories: string[];
  questRewards: any[];
  questTurnins: any[];
}

export function isRecipe(object: IEntity | null | undefined): object is IRecipe {
  return !!object && object.type === 'recipe' && 'ingredients' in object && 'output' in object;
}

export function isItem(object: IEntity | null | undefined): object is IItem {
  return !!object && object.type === 'item';
}

export function isPerk(object: IEntity | null | undefined): object is IPerk {
  return !!object && object.type === 'perk';
}

export function isStatusEffect(object: IEntity | null | undefined): object is IStatusEffect {
  return !!object && 'bonuses' in object;
}

export function isCurrency(object: IEntity | null | undefined): object is IItem {
  return !!object && object.type === 'currency';
}

export function isCategory(object: IIngredient | ICategory | null | undefined): object is ICategory {
  return !!object && object.type === 'category';
}
