import { startOfWeek } from "./dates";
import { normalizeIngredientName, normalizeQuantity, scaleIngredients } from "./scaling";
import type {
  Aisle,
  AppData,
  CookBatch,
  IngredientUnit,
  MealEntry,
  Recipe,
} from "./types";

export interface ShoppingItemSource {
  recipeId: string;
  recipeName: string;
  cookBatchId: string;
}

export interface ShoppingItem {
  key: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  aisle: Aisle;
  sources: ShoppingItemSource[];
}

export function remainingPortions(
  batch: CookBatch,
  entries: MealEntry[],
): number {
  const used = entries
    .filter((entry) => entry.cookBatchId === batch.id && entry.kind === "recipe")
    .reduce((sum, entry) => sum + (entry.portions ?? 0), 0);
  return Math.round((batch.totalPortions - used) * 100) / 100;
}

export function firstServingDate(
  batch: CookBatch,
  entries: MealEntry[],
): string {
  const dates = entries
    .filter((entry) => entry.cookBatchId === batch.id && entry.kind === "recipe")
    .map((entry) => entry.date)
    .sort();
  return dates[0] ?? batch.shopWeekStart;
}

export function shopWeekForBatch(
  batch: CookBatch,
  entries: MealEntry[],
  weekStartsOn: 0 | 1,
): string {
  return startOfWeek(firstServingDate(batch, entries), weekStartsOn);
}

export function buildShoppingList(
  weekStart: string,
  data: Pick<AppData, "cookBatches" | "mealEntries" | "settings">,
  recipes: Recipe[],
): ShoppingItem[] {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const merged = new Map<string, ShoppingItem>();

  for (const batch of data.cookBatches) {
    const shopWeek = shopWeekForBatch(
      batch,
      data.mealEntries,
      data.settings.weekStartsOn,
    );
    if (shopWeek !== weekStart) {
      continue;
    }

    const recipe = recipeMap.get(batch.recipeId);
    if (!recipe || recipe.archived) {
      continue;
    }

    const scaled = scaleIngredients(
      recipe.ingredients,
      recipe.servings,
      batch.totalPortions,
    );

    for (const ingredient of scaled) {
      const normalized = normalizeQuantity(ingredient.quantity, ingredient.unit);
      const name = normalizeIngredientName(ingredient.name);
      const key = `${name}|${normalized.unit}|${ingredient.aisle}`;
      const existing = merged.get(key);
      const source = {
        recipeId: recipe.id,
        recipeName: recipe.name,
        cookBatchId: batch.id,
      };
      if (existing) {
        existing.quantity += normalized.quantity;
        existing.sources.push(source);
      } else {
        merged.set(key, {
          key,
          name: ingredient.name.trim(),
          quantity: normalized.quantity,
          unit: normalized.unit,
          aisle: ingredient.aisle,
          sources: [source],
        });
      }
    }
  }

  return [...merged.values()].sort((a, b) => {
    if (a.aisle !== b.aisle) {
      return a.aisle.localeCompare(b.aisle);
    }
    return a.name.localeCompare(b.name);
  });
}
