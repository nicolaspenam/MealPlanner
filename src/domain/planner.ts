import { startOfWeek } from "./dates";
import { createId } from "./ids";
import { remainingPortions } from "./shoppingList";
import type {
  AppData,
  CookBatch,
  DaySlotOverride,
  MealEntry,
  MealSlotTemplate,
  Recipe,
} from "./types";

export function slotsForDate(data: AppData, date: string): MealSlotTemplate[] {
  const override = data.daySlotOverrides.find((item) => item.date === date);
  const slots = override?.slots ?? data.settings.defaultSlots;
  return [...slots].sort((a, b) => a.order - b.order);
}

export function entriesForSlot(
  data: AppData,
  date: string,
  slotId: string,
): MealEntry[] {
  return data.mealEntries.filter(
    (entry) => entry.date === date && entry.slotId === slotId,
  );
}

export type LeftoverBatch = {
  batch: CookBatch;
  recipe: Recipe;
  remaining: number;
};

export function leftoverBatches(
  data: AppData,
  recipes: Recipe[],
): LeftoverBatch[] {
  return data.cookBatches
    .map((batch) => {
      const recipe = recipes.find((item) => item.id === batch.recipeId);
      const remaining = remainingPortions(batch, data.mealEntries);
      return recipe ? { batch, recipe, remaining } : null;
    })
    .filter((item): item is LeftoverBatch => Boolean(item && item.remaining > 0))
    .sort((a, b) => a.recipe.name.localeCompare(b.recipe.name));
}

export function createCookBatch(input: {
  recipeId: string;
  totalPortions: number;
  firstDate: string;
  weekStartsOn: 0 | 1;
  now?: Date;
}): CookBatch {
  if (input.totalPortions <= 0) {
    throw new Error("Cook batch must produce at least one portion");
  }
  return {
    id: createId("batch"),
    recipeId: input.recipeId,
    totalPortions: input.totalPortions,
    shopWeekStart: startOfWeek(input.firstDate, input.weekStartsOn),
    createdAt: (input.now ?? new Date()).toISOString(),
  };
}

export function assignRecipeMeal(input: {
  date: string;
  slotId: string;
  recipeId: string;
  portions: number;
  cookBatchId: string;
}): MealEntry {
  if (input.portions <= 0) {
    throw new Error("Meal portions must be greater than 0");
  }
  return {
    id: createId("meal"),
    date: input.date,
    slotId: input.slotId,
    kind: "recipe",
    recipeId: input.recipeId,
    cookBatchId: input.cookBatchId,
    portions: input.portions,
  };
}

export function assignEatingOut(input: {
  date: string;
  slotId: string;
  name: string;
}): MealEntry {
  return {
    id: createId("meal"),
    date: input.date,
    slotId: input.slotId,
    kind: "eating_out",
    eatingOutName: input.name.trim() || "Eating out",
  };
}

export function setDaySlots(
  overrides: DaySlotOverride[],
  date: string,
  slots: MealSlotTemplate[],
): DaySlotOverride[] {
  const next = overrides.filter((item) => item.date !== date);
  next.push({ date, slots });
  return next;
}

export function addSlotToDay(
  current: MealSlotTemplate[],
  name: string,
): MealSlotTemplate[] {
  const trimmed = name.trim() || "Snack";
  const order = current.length === 0 ? 0 : Math.max(...current.map((slot) => slot.order)) + 1;
  return [...current, { id: createId("slot"), name: trimmed, order }];
}

export function removeSlotFromDay(
  current: MealSlotTemplate[],
  slotId: string,
): MealSlotTemplate[] {
  return current.filter((slot) => slot.id !== slotId);
}
