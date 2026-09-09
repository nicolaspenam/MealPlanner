import type { Recipe } from "./types";

export function resolveRecipes(
  builtins: Recipe[],
  userRecipes: Recipe[],
  options: { includeArchived?: boolean } = {},
): Recipe[] {
  const overlays = new Map<string, Recipe>();
  const custom: Recipe[] = [];

  for (const recipe of userRecipes) {
    if (recipe.source === "builtin" && recipe.builtinId) {
      overlays.set(recipe.builtinId, recipe);
    } else if (recipe.source === "custom") {
      custom.push(recipe);
    }
  }

  const mergedBuiltins = builtins.map((recipe) => {
    const overlay = overlays.get(recipe.builtinId ?? recipe.id);
    return overlay ?? recipe;
  });

  const all = [...mergedBuiltins, ...custom];
  if (options.includeArchived) {
    return all;
  }
  return all.filter((recipe) => !recipe.archived);
}

export function findRecipe(
  recipes: Recipe[],
  recipeId: string,
): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === recipeId);
}

export function validateRecipe(recipe: Recipe): string[] {
  const errors: string[] = [];
  if (!recipe.name.trim()) {
    errors.push("Name is required");
  }
  if (!Number.isFinite(recipe.servings) || recipe.servings <= 0) {
    errors.push("Servings must be greater than 0");
  }
  if (recipe.ingredients.length === 0) {
    errors.push("Add at least one ingredient");
  }
  for (const ingredient of recipe.ingredients) {
    if (!ingredient.name.trim()) {
      errors.push("Every ingredient needs a name");
      break;
    }
    if (!Number.isFinite(ingredient.quantity) || ingredient.quantity <= 0) {
      errors.push(`Quantity for ${ingredient.name || "an ingredient"} must be greater than 0`);
      break;
    }
  }
  return errors;
}
