import { describe, expect, it } from "vitest";
import { PlannerStore } from "./store";
import { memoryStorage } from "./storage";
import { buildShoppingList } from "../domain/shoppingList";
import { startOfWeek } from "../domain/dates";

function store() {
  return new PlannerStore(memoryStorage());
}

describe("PlannerStore", () => {
  it("scales a 2-portion recipe to 4 portions and shops the doubled ingredients", () => {
    const planner = store();
    planner.planNewBatch({
      date: "2026-09-09",
      slotId: "breakfast",
      recipeId: "overnight-oats-berries",
      cookPortions: 4,
      servePortions: 2,
    });

    const list = buildShoppingList(
      startOfWeek("2026-09-09"),
      planner.getSnapshot(),
      planner.recipes(),
    );
    expect(list.find((item) => item.name === "Rolled oats")?.quantity).toBe(160);
    expect(planner.leftoverBatches()[0]?.remaining).toBe(2);
  });

  it("does not shop leftovers that started in a previous week", () => {
    const planner = store();
    planner.planNewBatch({
      date: "2026-09-09",
      slotId: "dinner",
      recipeId: "turkey-chili",
      cookPortions: 6,
      servePortions: 2,
    });
    const batchId = planner.getSnapshot().cookBatches[0]?.id;
    expect(batchId).toBeTruthy();
    planner.planLeftover({
      date: "2026-09-16",
      slotId: "lunch",
      cookBatchId: batchId!,
      portions: 2,
    });

    const week1 = buildShoppingList("2026-09-07", planner.getSnapshot(), planner.recipes(true));
    const week2 = buildShoppingList("2026-09-14", planner.getSnapshot(), planner.recipes(true));
    expect(week1.find((item) => item.name === "Ground turkey")?.quantity).toBe(600);
    expect(week2).toEqual([]);
  });

  it("exports and restores planned meals on a new device", () => {
    const original = store();
    original.planEatingOut({ date: "2026-09-10", slotId: "dinner", name: "Pizza" });
    original.planNewBatch({
      date: "2026-09-08",
      slotId: "lunch",
      recipeId: "lentil-soup",
      cookPortions: 4,
      servePortions: 1,
    });
    const payload = JSON.stringify(original.exportPayload());

    const restored = store();
    restored.importJson(payload);
    expect(restored.getSnapshot().mealEntries).toHaveLength(2);
    expect(restored.getSnapshot().cookBatches).toHaveLength(1);
    expect(restored.getSnapshot().mealEntries.some((entry) => entry.eatingOutName === "Pizza")).toBe(true);
  });

  it("lets a day add a snack slot without changing other days", () => {
    const planner = store();
    planner.addDaySlot("2026-09-09", "Snack");
    expect(planner.slotsFor("2026-09-09").map((slot) => slot.name)).toEqual([
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
    ]);
    expect(planner.slotsFor("2026-09-10")).toHaveLength(3);
  });

  it("persists recipe overlays for builtin recipes", () => {
    const planner = store();
    const oats = planner.recipes().find((recipe) => recipe.id === "overnight-oats-berries");
    expect(oats).toBeTruthy();
    planner.upsertRecipe({
      ...oats!,
      name: "Protein overnight oats",
      servings: 4,
    });
    expect(planner.recipes().find((recipe) => recipe.id === "overnight-oats-berries")?.name).toBe(
      "Protein overnight oats",
    );
  });
});
