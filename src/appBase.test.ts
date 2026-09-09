import { describe, expect, it } from "vitest";
import { routerBasename } from "./appBase";

describe("routerBasename", () => {
  it("uses / for a site served from the domain root", () => {
    expect(routerBasename("/")).toBe("/");
  });

  it("strips the trailing slash for a GitHub Pages project path", () => {
    expect(routerBasename("/MealPlanner/")).toBe("/MealPlanner");
  });
});
