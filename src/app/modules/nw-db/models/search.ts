import { Tier, ItemType, ObjectType, TradeSkill, Rarity, ObjectRef } from "./types";

export interface SearchItem extends ObjectRef {
  id: string;
  type: ObjectType;
  level?: number;
  gearScore?: number | null;
  recipeLevel: number;
  recipeSkill: TradeSkill;
  searchRank: number;
}
