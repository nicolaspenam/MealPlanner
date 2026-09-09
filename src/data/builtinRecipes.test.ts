import { describe, expect, it } from "vitest";
import { getBuiltinRecipes } from "./builtinRecipes";

describe("builtin recipes", () => {
  it("includes a large healthy catalog with portions and ingredients", () => {
    const recipes = getBuiltinRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(40);
    for (const recipe of recipes) {
      expect(recipe.servings).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.source).toBe("builtin");
    }
  });
});
