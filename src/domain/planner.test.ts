import { describe, expect, it } from "vitest";
import { weekDates } from "./dates";
import { addSlotToDay, setDaySlots, slotOnDateByName, slotRowsForWeek } from "./planner";
import { emptyAppData } from "./types";

describe("week calendar rows", () => {
  it("uses breakfast, lunch, and dinner as the default rows", () => {
    const rows = slotRowsForWeek(emptyAppData(), weekDates("2026-09-07"));
    expect(rows.map((row) => row.name)).toEqual(["Breakfast", "Lunch", "Dinner"]);
  });

  it("adds an extra snack row when any day in the week has one", () => {
    const data = emptyAppData();
    const monday = addSlotToDay(data.settings.defaultSlots, "Snack");
    data.daySlotOverrides = setDaySlots(data.daySlotOverrides, "2026-09-07", monday);
    const rows = slotRowsForWeek(data, weekDates("2026-09-07"));
    expect(rows.map((row) => row.name)).toEqual(["Breakfast", "Lunch", "Dinner", "Snack"]);
    expect(slotOnDateByName(data, "2026-09-07", "Snack")?.name).toBe("Snack");
    expect(slotOnDateByName(data, "2026-09-08", "Snack")).toBeUndefined();
  });
});
