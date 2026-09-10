import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages branch bundle", () => {
  it("loads the compiled app on github.io instead of TypeScript source", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('location.hostname.endsWith("github.io")');
    expect(html).toContain("./assets/app.js");
    expect(html).toContain("./assets/app.css");
  });

  it("commits a compiled bundle GitHub Pages can serve from main", () => {
    expect(existsSync("assets/app.js")).toBe(true);
    expect(existsSync("assets/app.css")).toBe(true);
  });
});
