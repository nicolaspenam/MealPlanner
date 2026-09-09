import type { Aisle, Ingredient, IngredientUnit } from "./types";

const MASS_TO_G: Partial<Record<IngredientUnit, number>> = {
  g: 1,
  kg: 1000,
};

const VOLUME_TO_ML: Partial<Record<IngredientUnit, number>> = {
  ml: 1,
  l: 1000,
};

export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface NormalizedQuantity {
  quantity: number;
  unit: IngredientUnit;
}

export function normalizeQuantity(
  quantity: number,
  unit: IngredientUnit,
): NormalizedQuantity {
  const mass = MASS_TO_G[unit];
  if (mass !== undefined) {
    const grams = quantity * mass;
    if (grams >= 1000) {
      return { quantity: grams / 1000, unit: "kg" };
    }
    return { quantity: grams, unit: "g" };
  }

  const volume = VOLUME_TO_ML[unit];
  if (volume !== undefined) {
    const ml = quantity * volume;
    if (ml >= 1000) {
      return { quantity: ml / 1000, unit: "l" };
    }
    return { quantity: ml, unit: "ml" };
  }

  return { quantity, unit };
}

export function scaleIngredients(
  ingredients: Ingredient[],
  servings: number,
  portions: number,
): Ingredient[] {
  if (servings <= 0) {
    throw new Error("Recipe servings must be greater than 0");
  }
  const scale = portions / servings;
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: ingredient.quantity * scale,
  }));
}

export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return String(quantity);
  }
  const rounded = Math.round(quantity * 100) / 100;
  return String(rounded);
}

const COUNT_PLURALS: Partial<Record<IngredientUnit, string>> = {
  piece: "pieces",
  clove: "cloves",
  bunch: "bunches",
  slice: "slices",
  can: "cans",
  pack: "packs",
};

export function formatUnit(quantity: number, unit: IngredientUnit): string {
  if (quantity === 1) {
    return unit;
  }
  return COUNT_PLURALS[unit] ?? unit;
}

export function formatAmount(quantity: number, unit: IngredientUnit): string {
  return `${formatQuantity(quantity)} ${formatUnit(quantity, unit)}`;
}

export function shoppingItemKey(
  name: string,
  unit: IngredientUnit,
  aisle: Aisle,
): string {
  const normalized = normalizeQuantity(1, unit);
  return `${normalizeIngredientName(name)}|${normalized.unit}|${aisle}`;
}
