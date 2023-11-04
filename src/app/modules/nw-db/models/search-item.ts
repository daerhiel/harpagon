import { ItemTier, ItemType } from "./base-item";

export interface SearchItem {
  searchRank: number;
  id: string;
  name: string;
  type: ItemType;
  itemType: string;
  icon: string;
  rarity: number;
  tier: ItemTier;
  gearScore: number | null;
}
