import { describe, expect, it } from "vitest";
import { resolveRecipes } from "./recipes";
import type { Recipe } from "./types";

const builtin: Recipe = {
  id: "oats",
  builtinId: "oats",
  name: "Overnight oats",
  description: "Original",
  servings: 2,
  ingredients: [
    { id: "i1", name: "Oats", quantity: 80, unit: "g", aisle: "grains" },
  ],
  tags: ["breakfast"],
  source: "builtin",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("resolveRecipes", () => {
  it("overlays user edits onto builtin recipes without changing the id", () => {
    const overlay: Recipe = {
      ...builtin,
      name: "Overnight oats with protein",
      servings: 4,
    };
    const resolved = resolveRecipes([builtin], [overlay]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.id).toBe("oats");
    expect(resolved[0]?.name).toBe("Overnight oats with protein");
    expect(resolved[0]?.servings).toBe(4);
  });

  it("includes custom recipes and hides archived ones by default", () => {
    const custom: Recipe = {
      id: "soup",
      name: "My soup",
      description: "",
      servings: 2,
      ingredients: [
        { id: "i1", name: "Lentils", quantity: 100, unit: "g", aisle: "pantry" },
      ],
      tags: [],
      source: "custom",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const archived: Recipe = { ...custom, id: "old", archived: true, name: "Old soup" };
    const resolved = resolveRecipes([builtin], [custom, archived]);
    expect(resolved.map((recipe) => recipe.id)).toEqual(["oats", "soup"]);
  });
});
