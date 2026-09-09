import { describe, expect, it } from "vitest";
import { buildShoppingList, remainingPortions, shopWeekForBatch } from "./shoppingList";
import { emptyAppData, type CookBatch, type MealEntry, type Recipe } from "./types";

const chili: Recipe = {
  id: "chili",
  builtinId: "chili",
  name: "Turkey chili",
  description: "",
  servings: 6,
  source: "builtin",
  tags: ["dinner"],
  updatedAt: "2026-01-01T00:00:00.000Z",
  ingredients: [
    { id: "c1", name: "Ground turkey", quantity: 600, unit: "g", aisle: "meat" },
    { name: "Canned tomatoes", id: "c2", quantity: 800, unit: "g", aisle: "pantry" },
  ],
};

const oats: Recipe = {
  id: "oats",
  name: "Overnight oats",
  description: "",
  servings: 2,
  source: "custom",
  tags: ["breakfast"],
  updatedAt: "2026-01-01T00:00:00.000Z",
  ingredients: [
    { id: "o1", name: "Rolled oats", quantity: 80, unit: "g", aisle: "grains" },
    { id: "o2", name: "Milk", quantity: 300, unit: "ml", aisle: "dairy" },
  ],
};

function batch(partial: Partial<CookBatch> & Pick<CookBatch, "id" | "recipeId">): CookBatch {
  return {
    totalPortions: 6,
    shopWeekStart: "2026-09-07",
    createdAt: "2026-09-07T00:00:00.000Z",
    ...partial,
  };
}

function meal(partial: Partial<MealEntry> & Pick<MealEntry, "id" | "date">): MealEntry {
  return {
    slotId: "dinner",
    kind: "recipe",
    portions: 2,
    ...partial,
  };
}

describe("shopping list", () => {
  it("includes scaled ingredients for the cook batch, not only served meals", () => {
    const data = emptyAppData();
    data.cookBatches = [batch({ id: "b1", recipeId: "oats", totalPortions: 4 })];
    data.mealEntries = [
      meal({ id: "m1", date: "2026-09-08", recipeId: "oats", cookBatchId: "b1", portions: 2 }),
    ];

    const list = buildShoppingList("2026-09-07", data, [oats]);
    const oatsItem = list.find((item) => item.name === "Rolled oats");
    expect(oatsItem?.quantity).toBe(160);
    expect(oatsItem?.unit).toBe("g");
  });

  it("puts groceries on the first week a leftover batch is served", () => {
    const data = emptyAppData();
    data.cookBatches = [batch({ id: "b1", recipeId: "chili", totalPortions: 6, shopWeekStart: "2026-09-14" })];
    data.mealEntries = [
      meal({
        id: "m1",
        date: "2026-09-09",
        recipeId: "chili",
        cookBatchId: "b1",
        portions: 2,
      }),
      meal({
        id: "m2",
        date: "2026-09-16",
        recipeId: "chili",
        cookBatchId: "b1",
        portions: 2,
        slotId: "lunch",
      }),
    ];

    expect(shopWeekForBatch(data.cookBatches[0]!, data.mealEntries, 1)).toBe("2026-09-07");

    const week1 = buildShoppingList("2026-09-07", data, [chili]);
    const week2 = buildShoppingList("2026-09-14", data, [chili]);

    expect(week1.find((item) => item.name === "Ground turkey")?.quantity).toBe(600);
    expect(week2).toEqual([]);
  });

  it("shops a second cook of the same recipe in its own week", () => {
    const data = emptyAppData();
    data.cookBatches = [
      batch({ id: "b1", recipeId: "chili", totalPortions: 6 }),
      batch({ id: "b2", recipeId: "chili", totalPortions: 6, shopWeekStart: "2026-09-14" }),
    ];
    data.mealEntries = [
      meal({ id: "m1", date: "2026-09-08", recipeId: "chili", cookBatchId: "b1", portions: 6 }),
      meal({ id: "m2", date: "2026-09-15", recipeId: "chili", cookBatchId: "b2", portions: 6 }),
    ];

    const week1 = buildShoppingList("2026-09-07", data, [chili]);
    const week2 = buildShoppingList("2026-09-14", data, [chili]);
    expect(week1).toHaveLength(2);
    expect(week2).toHaveLength(2);
  });

  it("does not add eating out meals to the shopping list", () => {
    const data = emptyAppData();
    data.mealEntries = [
      {
        id: "m1",
        date: "2026-09-09",
        slotId: "dinner",
        kind: "eating_out",
        eatingOutName: "Tacos",
      },
    ];
    expect(buildShoppingList("2026-09-07", data, [chili])).toEqual([]);
  });

  it("merges the same ingredient from two recipes", () => {
    const extra: Recipe = {
      ...chili,
      id: "chili-2",
      name: "Bean chili",
    };
    const data = emptyAppData();
    data.cookBatches = [
      batch({ id: "b1", recipeId: "chili", totalPortions: 6 }),
      batch({ id: "b2", recipeId: "chili-2", totalPortions: 6 }),
    ];
    data.mealEntries = [
      meal({ id: "m1", date: "2026-09-08", recipeId: "chili", cookBatchId: "b1", portions: 6 }),
      meal({ id: "m2", date: "2026-09-09", recipeId: "chili-2", cookBatchId: "b2", portions: 6 }),
    ];
    const list = buildShoppingList("2026-09-07", data, [chili, extra]);
    expect(list.find((item) => item.name === "Ground turkey")?.quantity).toBe(1200);
  });

  it("tracks leftover portions after assignments", () => {
    const cooked = batch({ id: "b1", recipeId: "chili", totalPortions: 6 });
    const entries = [
      meal({ id: "m1", date: "2026-09-08", cookBatchId: "b1", recipeId: "chili", portions: 2 }),
    ];
    expect(remainingPortions(cooked, entries)).toBe(4);
  });
});
