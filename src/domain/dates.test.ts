import { describe, expect, it } from "vitest";
import { addDays, monthDay, startOfWeek, weekDates, weekdayShort } from "./dates";

describe("dates", () => {
  it("starts weeks on Monday by default", () => {
    expect(startOfWeek("2026-09-09")).toBe("2026-09-07");
    expect(startOfWeek("2026-09-07")).toBe("2026-09-07");
    expect(startOfWeek("2026-09-13")).toBe("2026-09-07");
  });

  it("can start weeks on Sunday", () => {
    expect(startOfWeek("2026-09-09", 0)).toBe("2026-09-06");
  });

  it("returns seven dates for a week", () => {
    expect(weekDates("2026-09-07")).toEqual([
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
    ]);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });

  it("formats compact calendar day headings", () => {
    expect(monthDay("2026-09-07")).toBe("7");
    expect(weekdayShort("2026-09-07").length).toBeGreaterThan(1);
  });
});
