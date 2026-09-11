import { describe, expect, it } from "vitest";
import { getBuiltinRecipes } from "./builtinRecipes";
import { TREAT_TAG } from "./recipeDraft";

describe("builtin recipes", () => {
  it("includes a large healthy catalog with portions, ingredients, and unique names", () => {
    const recipes = getBuiltinRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(90);

    const ids = recipes.map((recipe) => recipe.id);
    const names = recipes.map((recipe) => recipe.name.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);

    for (const recipe of recipes) {
      expect(recipe.servings).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.source).toBe("builtin");
      expect((recipe.instructions ?? []).length).toBeGreaterThan(0);
      expect((recipe.instructions ?? []).every((step) => step.trim().length > 0)).toBe(true);
    }
  });

  it("labels indulgent recipes as yummy treats without making them the bulk of the catalog", () => {
    const recipes = getBuiltinRecipes();
    const treats = recipes.filter((recipe) => recipe.tags.includes(TREAT_TAG));
    expect(treats.length).toBeGreaterThanOrEqual(8);
    expect(treats.length).toBeLessThan(recipes.length / 2);
    expect(treats.some((recipe) => recipe.name.toLowerCase().includes("brownie"))).toBe(true);
  });
});
