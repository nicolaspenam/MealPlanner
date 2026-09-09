import { describe, expect, it } from "vitest";
import { formatAmount, formatQuantity, normalizeQuantity, scaleIngredients } from "./scaling";
import type { Ingredient } from "./types";

const chicken: Ingredient = {
  id: "1",
  name: "Chicken breast",
  quantity: 200,
  unit: "g",
  aisle: "meat",
};

describe("scaling", () => {
  it("doubles ingredients when cooking 2x a 2-portion recipe", () => {
    const scaled = scaleIngredients([chicken], 2, 4);
    expect(scaled[0]?.quantity).toBe(400);
  });

  it("converts grams to kilograms when merging large amounts", () => {
    expect(normalizeQuantity(1500, "g")).toEqual({ quantity: 1.5, unit: "kg" });
    expect(normalizeQuantity(0.5, "kg")).toEqual({ quantity: 500, unit: "g" });
  });

  it("converts liters and milliliters", () => {
    expect(normalizeQuantity(1, "l")).toEqual({ quantity: 1, unit: "l" });
    expect(normalizeQuantity(250, "ml")).toEqual({ quantity: 250, unit: "ml" });
  });

  it("formats quantities without trailing zeros", () => {
    expect(formatQuantity(2)).toBe("2");
    expect(formatQuantity(1.5)).toBe("1.5");
  });

  it("pluralizes countable units on the shopping list", () => {
    expect(formatAmount(4, "can")).toBe("4 cans");
    expect(formatAmount(1, "can")).toBe("1 can");
    expect(formatAmount(2, "g")).toBe("2 g");
  });
});
