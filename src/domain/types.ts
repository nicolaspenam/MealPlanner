export const APP_DATA_VERSION = 1;

export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "piece",
  "clove",
  "pinch",
  "bunch",
  "slice",
  "can",
  "pack",
] as const;

export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];

export const AISLES = [
  "produce",
  "meat",
  "seafood",
  "dairy",
  "bakery",
  "grains",
  "pantry",
  "frozen",
  "spices",
  "other",
] as const;

export type Aisle = (typeof AISLES)[number];

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  aisle: Aisle;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  ingredients: Ingredient[];
  tags: string[];
  source: "builtin" | "custom";
  builtinId?: string;
  archived?: boolean;
  updatedAt: string;
}

export interface CookBatch {
  id: string;
  recipeId: string;
  totalPortions: number;
  shopWeekStart: string;
  createdAt: string;
}

export interface MealSlotTemplate {
  id: string;
  name: string;
  order: number;
}

export interface DaySlotOverride {
  date: string;
  slots: MealSlotTemplate[];
}

export interface MealEntry {
  id: string;
  date: string;
  slotId: string;
  kind: "recipe" | "eating_out";
  recipeId?: string;
  cookBatchId?: string;
  portions?: number;
  eatingOutName?: string;
}

export interface Settings {
  weekStartsOn: 0 | 1;
  defaultSlots: MealSlotTemplate[];
}

export interface ShoppingCheck {
  weekStart: string;
  itemKey: string;
  checked: boolean;
}

export interface AppData {
  version: number;
  recipes: Recipe[];
  cookBatches: CookBatch[];
  mealEntries: MealEntry[];
  daySlotOverrides: DaySlotOverride[];
  settings: Settings;
  shoppingChecks: ShoppingCheck[];
}

export interface ExportPayload {
  version: number;
  exportedAt: string;
  data: AppData;
}

export const DEFAULT_SLOTS: MealSlotTemplate[] = [
  { id: "breakfast", name: "Breakfast", order: 0 },
  { id: "lunch", name: "Lunch", order: 1 },
  { id: "dinner", name: "Dinner", order: 2 },
];

export function defaultSettings(): Settings {
  return {
    weekStartsOn: 1,
    defaultSlots: DEFAULT_SLOTS.map((slot) => ({ ...slot })),
  };
}

export function emptyAppData(): AppData {
  return {
    version: APP_DATA_VERSION,
    recipes: [],
    cookBatches: [],
    mealEntries: [],
    daySlotOverrides: [],
    settings: defaultSettings(),
    shoppingChecks: [],
  };
}
