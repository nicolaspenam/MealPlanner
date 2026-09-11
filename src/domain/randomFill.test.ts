import { describe, expect, it } from "vitest";
import { getBuiltinRecipes } from "../data/builtinRecipes";
import { isTreatRecipe, TREAT_TAG } from "../data/recipeDraft";
import { weekDates } from "./dates";
import {
  emptySlotsForWeek,
  fillRemainingWeek,
  healthyRecipesForSlot,
  mealTagForSlot,
  pickRecipe,
} from "./randomFill";
import { remainingPortions, buildShoppingList } from "./shoppingList";
import { emptyAppData, type Recipe } from "./types";

const WEEK_START = "2026-09-07";
const DATES = weekDates(WEEK_START);

function recipe(partial: Partial<Recipe> & Pick<Recipe, "id" | "name" | "tags">): Recipe {
  return {
    description: "",
    servings: 2,
    ingredients: [{ id: `${partial.id}-ing`, name: "Oats", quantity: 80, unit: "g", aisle: "grains" }],
    source: "builtin",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("random fill", () => {
  it("maps slot names to meal tags", () => {
    expect(mealTagForSlot("Breakfast")).toBe("breakfast");
    expect(mealTagForSlot("Late lunch")).toBe("lunch");
    expect(mealTagForSlot("Sunday supper")).toBe("dinner");
    expect(mealTagForSlot("Afternoon snack")).toBe("snack");
    expect(mealTagForSlot("Brunch")).toBe("");
  });

  it("lists only empty slots for the visible week", () => {
    const data = emptyAppData();
    data.mealEntries = [
      {
        id: "meal-1",
        date: "2026-09-07",
        slotId: "breakfast",
        kind: "eating_out",
        eatingOutName: "Cafe",
      },
    ];
    const empty = emptySlotsForWeek(data, DATES);
    expect(empty).toHaveLength(20);
    expect(empty.some((slot) => slot.date === "2026-09-07" && slot.slotId === "breakfast")).toBe(
      false,
    );
  });

  it("keeps treats out of the healthy pool and prefers matching meal tags", () => {
    const oats = recipe({ id: "oats", name: "Oats", tags: ["breakfast"] });
    const chili = recipe({ id: "chili", name: "Chili", tags: ["dinner"] });
    const cake = recipe({ id: "cake", name: "Cake", tags: [TREAT_TAG, "breakfast"] });
    expect(healthyRecipesForSlot([oats, chili, cake], "Breakfast").map((item) => item.id)).toEqual([
      "oats",
    ]);
    expect(healthyRecipesForSlot([oats, chili, cake], "Snack").map((item) => item.id)).toEqual([
      "oats",
      "chili",
    ]);
  });

  it("prefers unused recipes, then wraps when the pool is exhausted", () => {
    const pool = [
      recipe({ id: "a", name: "A", tags: ["breakfast"] }),
      recipe({ id: "b", name: "B", tags: ["breakfast"] }),
    ];
    const used = new Set(["a"]);
    expect(pickRecipe(pool, used, () => 0)?.id).toBe("b");
    expect(pickRecipe(pool, new Set(["a", "b"]), () => 0)?.id).toBe("a");
  });

  it("fills remaining slots with one-portion healthy cooks and no leftovers", () => {
    const data = emptyAppData();
    data.mealEntries = [
      {
        id: "keep-me",
        date: "2026-09-07",
        slotId: "lunch",
        kind: "recipe",
        recipeId: "lentil-soup",
        cookBatchId: "existing-batch",
        portions: 1,
      },
    ];
    data.cookBatches = [
      {
        id: "existing-batch",
        recipeId: "lentil-soup",
        totalPortions: 1,
        shopWeekStart: WEEK_START,
        createdAt: "2026-09-07T00:00:00.000Z",
      },
    ];

    const recipes = getBuiltinRecipes();
    const planned = fillRemainingWeek(data, DATES, recipes, () => 0);

    expect(planned.mealEntries).toHaveLength(20);
    expect(planned.cookBatches).toHaveLength(20);
    expect(planned.mealEntries.every((entry) => entry.portions === 1)).toBe(true);
    expect(planned.cookBatches.every((batch) => batch.totalPortions === 1)).toBe(true);
    expect(planned.mealEntries.some((entry) => entry.slotId === "lunch" && entry.date === "2026-09-07")).toBe(
      false,
    );

    const recipeIds = planned.mealEntries.map((entry) => entry.recipeId ?? "");
    expect(new Set(recipeIds).size).toBe(recipeIds.length);

    for (const entry of planned.mealEntries) {
      const chosen = recipes.find((item) => item.id === entry.recipeId);
      expect(chosen).toBeTruthy();
      expect(isTreatRecipe(chosen!)).toBe(false);
    }

    const next = {
      ...data,
      cookBatches: [...data.cookBatches, ...planned.cookBatches],
      mealEntries: [...data.mealEntries, ...planned.mealEntries],
    };
    for (const batch of planned.cookBatches) {
      expect(remainingPortions(batch, next.mealEntries)).toBe(0);
    }
    expect(buildShoppingList(WEEK_START, next, recipes).length).toBeGreaterThan(0);
  });
});
