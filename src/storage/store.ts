import { getBuiltinRecipes } from "../data/builtinRecipes";
import { parseImport, serializeExport } from "../domain/exportImport";
import { createId } from "../domain/ids";
import {
  addSlotToDay,
  assignEatingOut,
  assignRecipeMeal,
  createCookBatch,
  leftoverBatches as findLeftoverBatches,
  removeSlotFromDay,
  setDaySlots,
  slotsForDate,
} from "../domain/planner";
import { resolveRecipes, validateRecipe } from "../domain/recipes";
import { remainingPortions as leftoverCount } from "../domain/shoppingList";
import type {
  AppData,
  CookBatch,
  MealEntry,
  MealSlotTemplate,
  Recipe,
  Settings,
} from "../domain/types";
import { loadAppData, saveAppData, type StorageAdapter } from "./storage";

export class PlannerStore {
  private data: AppData;
  private listeners = new Set<() => void>();
  private readonly storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.data = loadAppData(storage);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): AppData => this.data;

  recipes(includeArchived = false): Recipe[] {
    return resolveRecipes(getBuiltinRecipes(), this.data.recipes, {
      includeArchived,
    });
  }

  leftoverBatches() {
    return findLeftoverBatches(this.data, this.recipes());
  }

  slotsFor(date: string): MealSlotTemplate[] {
    return slotsForDate(this.data, date);
  }

  private commit(next: AppData): void {
    this.data = next;
    saveAppData(this.storage, next);
    for (const listener of this.listeners) {
      listener();
    }
  }

  replaceAll(data: AppData): void {
    this.commit(data);
  }

  importJson(raw: string): void {
    this.replaceAll(parseImport(raw));
  }

  exportPayload() {
    return serializeExport(this.data);
  }

  updateSettings(patch: Partial<Settings>): void {
    this.commit({
      ...this.data,
      settings: { ...this.data.settings, ...patch },
    });
  }

  upsertRecipe(recipe: Recipe): string[] {
    const errors = validateRecipe(recipe);
    if (errors.length > 0) {
      return errors;
    }
    const existingIndex = this.data.recipes.findIndex((item) => item.id === recipe.id);
    const recipes = [...this.data.recipes];
    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.push(recipe);
    }
    this.commit({ ...this.data, recipes });
    return [];
  }

  archiveRecipe(recipeId: string): void {
    const current = this.recipes().find((recipe) => recipe.id === recipeId);
    if (!current) {
      return;
    }
    const archived: Recipe = {
      ...current,
      archived: true,
      updatedAt: new Date().toISOString(),
    };
    const recipes = this.data.recipes.filter((item) => item.id !== recipeId);
    recipes.push(archived);
    this.commit({ ...this.data, recipes });
  }

  planNewBatch(input: {
    date: string;
    slotId: string;
    recipeId: string;
    cookPortions: number;
    servePortions: number;
  }): void {
    const serve = Math.min(input.servePortions, input.cookPortions);
    const batch = createCookBatch({
      recipeId: input.recipeId,
      totalPortions: input.cookPortions,
      firstDate: input.date,
      weekStartsOn: this.data.settings.weekStartsOn,
    });
    const meal = assignRecipeMeal({
      date: input.date,
      slotId: input.slotId,
      recipeId: input.recipeId,
      portions: serve,
      cookBatchId: batch.id,
    });
    this.commit({
      ...this.data,
      cookBatches: [...this.data.cookBatches, batch],
      mealEntries: [...this.data.mealEntries, meal],
    });
  }

  planLeftover(input: {
    date: string;
    slotId: string;
    cookBatchId: string;
    portions: number;
  }): void {
    const batch = this.data.cookBatches.find((item) => item.id === input.cookBatchId);
    if (!batch) {
      throw new Error("That leftover batch no longer exists");
    }
    const remaining = leftoverCount(batch, this.data.mealEntries);
    if (input.portions > remaining) {
      throw new Error("Not enough leftover portions");
    }
    const meal = assignRecipeMeal({
      date: input.date,
      slotId: input.slotId,
      recipeId: batch.recipeId,
      portions: input.portions,
      cookBatchId: batch.id,
    });
    this.commit({
      ...this.data,
      mealEntries: [...this.data.mealEntries, meal],
    });
  }

  planEatingOut(input: { date: string; slotId: string; name: string }): void {
    const meal = assignEatingOut(input);
    this.commit({
      ...this.data,
      mealEntries: [...this.data.mealEntries, meal],
    });
  }

  removeMeal(mealId: string): void {
    const meal = this.data.mealEntries.find((entry) => entry.id === mealId);
    const mealEntries = this.data.mealEntries.filter((entry) => entry.id !== mealId);
    let cookBatches = this.data.cookBatches;
    if (meal?.cookBatchId) {
      const stillUsed = mealEntries.some((entry) => entry.cookBatchId === meal.cookBatchId);
      if (!stillUsed) {
        cookBatches = cookBatches.filter((batch) => batch.id !== meal.cookBatchId);
      }
    }
    this.commit({ ...this.data, mealEntries, cookBatches });
  }

  addDaySlot(date: string, name: string): void {
    const nextSlots = addSlotToDay(this.slotsFor(date), name);
    this.commit({
      ...this.data,
      daySlotOverrides: setDaySlots(this.data.daySlotOverrides, date, nextSlots),
    });
  }

  removeDaySlot(date: string, slotId: string): void {
    const nextSlots = removeSlotFromDay(this.slotsFor(date), slotId);
    const mealEntries = this.data.mealEntries.filter(
      (entry) => !(entry.date === date && entry.slotId === slotId),
    );
    this.commit({
      ...this.data,
      daySlotOverrides: setDaySlots(this.data.daySlotOverrides, date, nextSlots),
      mealEntries,
    });
  }

  resetDaySlots(date: string): void {
    this.commit({
      ...this.data,
      daySlotOverrides: this.data.daySlotOverrides.filter((item) => item.date !== date),
    });
  }

  toggleShoppingItem(weekStart: string, itemKey: string): void {
    const existing = this.data.shoppingChecks.find(
      (item) => item.weekStart === weekStart && item.itemKey === itemKey,
    );
    const shoppingChecks = this.data.shoppingChecks.filter(
      (item) => !(item.weekStart === weekStart && item.itemKey === itemKey),
    );
    shoppingChecks.push({
      weekStart,
      itemKey,
      checked: !existing?.checked,
    });
    this.commit({ ...this.data, shoppingChecks });
  }

  isShoppingChecked(weekStart: string, itemKey: string): boolean {
    return Boolean(
      this.data.shoppingChecks.find(
        (item) => item.weekStart === weekStart && item.itemKey === itemKey && item.checked,
      ),
    );
  }
}

export function newCustomRecipe(): Recipe {
  return {
    id: createId("recipe"),
    name: "",
    description: "",
    servings: 2,
    ingredients: [
      {
        id: createId("ing"),
        name: "",
        quantity: 1,
        unit: "g",
        aisle: "produce",
      },
    ],
    tags: [],
    source: "custom",
    updatedAt: new Date().toISOString(),
  };
}

export function forkBuiltin(recipe: Recipe): Recipe {
  return {
    ...recipe,
    source: "builtin",
    builtinId: recipe.builtinId ?? recipe.id,
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
    tags: [...recipe.tags],
    updatedAt: new Date().toISOString(),
  };
}

export type { CookBatch, MealEntry };
