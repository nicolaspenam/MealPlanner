import { assignRecipeMeal, createCookBatch, entriesForSlot, slotsForDate } from "./planner";
import { isTreatRecipe } from "../data/recipeDraft";
import type { AppData, CookBatch, MealEntry, Recipe } from "./types";

export type Rng = () => number;

export function mealTagForSlot(slotName: string): string {
  const name = slotName.trim().toLowerCase();
  if (name.includes("breakfast")) {
    return "breakfast";
  }
  if (name.includes("lunch")) {
    return "lunch";
  }
  if (name.includes("dinner") || name.includes("supper")) {
    return "dinner";
  }
  if (name.includes("snack")) {
    return "snack";
  }
  return "";
}

export function emptySlotsForWeek(
  data: AppData,
  dates: string[],
): Array<{ date: string; slotId: string; slotName: string }> {
  const empty: Array<{ date: string; slotId: string; slotName: string }> = [];
  for (const date of dates) {
    for (const slot of slotsForDate(data, date)) {
      if (entriesForSlot(data, date, slot.id).length === 0) {
        empty.push({ date, slotId: slot.id, slotName: slot.name });
      }
    }
  }
  return empty;
}

export function healthyRecipesForSlot(recipes: Recipe[], slotName: string): Recipe[] {
  const healthy = recipes.filter((recipe) => !isTreatRecipe(recipe));
  const tag = mealTagForSlot(slotName);
  if (!tag) {
    return healthy;
  }
  const tagged = healthy.filter((recipe) => recipe.tags.includes(tag));
  return tagged.length > 0 ? tagged : healthy;
}

export function pickRecipe(
  pool: Recipe[],
  usedIds: Set<string>,
  rng: Rng,
): Recipe | undefined {
  const unused = pool.filter((recipe) => !usedIds.has(recipe.id));
  const choices = unused.length > 0 ? unused : pool;
  if (choices.length === 0) {
    return undefined;
  }
  const index = Math.min(choices.length - 1, Math.floor(rng() * choices.length));
  return choices[index];
}

export function fillRemainingWeek(
  data: AppData,
  dates: string[],
  recipes: Recipe[],
  rng: Rng = Math.random,
): { cookBatches: CookBatch[]; mealEntries: MealEntry[] } {
  const cookBatches: CookBatch[] = [];
  const mealEntries: MealEntry[] = [];
  const usedIds = new Set<string>();

  for (const slot of emptySlotsForWeek(data, dates)) {
    const pool = healthyRecipesForSlot(recipes, slot.slotName);
    const recipe = pickRecipe(pool, usedIds, rng);
    if (!recipe) {
      continue;
    }
    usedIds.add(recipe.id);
    const batch = createCookBatch({
      recipeId: recipe.id,
      totalPortions: 1,
      firstDate: slot.date,
      weekStartsOn: data.settings.weekStartsOn,
    });
    const meal = assignRecipeMeal({
      date: slot.date,
      slotId: slot.slotId,
      recipeId: recipe.id,
      portions: 1,
      cookBatchId: batch.id,
    });
    cookBatches.push(batch);
    mealEntries.push(meal);
  }

  return { cookBatches, mealEntries };
}
