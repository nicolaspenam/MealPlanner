import { describe, expect, it } from "vitest";
import { parseImport, serializeExport } from "./exportImport";
import { emptyAppData } from "./types";

describe("export and import", () => {
  it("round-trips planner data", () => {
    const data = emptyAppData();
    data.mealEntries = [
      {
        id: "m1",
        date: "2026-09-09",
        slotId: "lunch",
        kind: "eating_out",
        eatingOutName: "Sushi",
      },
    ];
    data.settings.weekStartsOn = 0;
    const payload = serializeExport(data, new Date("2026-09-09T12:00:00.000Z"));
    const restored = parseImport(JSON.stringify(payload));
    expect(restored.mealEntries).toEqual(data.mealEntries);
    expect(restored.settings.weekStartsOn).toBe(0);
  });

  it("accepts a raw AppData object without the export wrapper", () => {
    const data = emptyAppData();
    data.recipes = [
      {
        id: "r1",
        name: "Custom soup",
        description: "",
        servings: 2,
        ingredients: [
          { id: "i1", name: "Lentils", quantity: 100, unit: "g", aisle: "pantry" },
        ],
        tags: [],
        source: "custom",
        updatedAt: "2026-09-09T00:00:00.000Z",
      },
    ];
    const restored = parseImport(JSON.stringify(data));
    expect(restored.recipes[0]?.name).toBe("Custom soup");
  });

  it("rejects invalid JSON", () => {
    expect(() => parseImport("not-json")).toThrow(/not valid JSON/);
  });
});
