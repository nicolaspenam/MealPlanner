import { formatDayHeading } from "../domain/dates";
import { entriesForSlot, slotsForDate } from "../domain/planner";
import type { AppData, Recipe } from "../domain/types";

export function WeekView({
  dates,
  today,
  data,
  recipes,
  onAdd,
  onRemoveMeal,
  onAddSlot,
  onRemoveSlot,
}: {
  dates: string[];
  today: string;
  data: AppData;
  recipes: Recipe[];
  onAdd: (date: string, slotId: string) => void;
  onRemoveMeal: (mealId: string) => void;
  onAddSlot: (date: string) => void;
  onRemoveSlot: (date: string, slotId: string) => void;
}) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return (
    <div className="day-list">
      {dates.map((date) => {
        const slots = slotsForDate(data, date);
        return (
          <section key={date} className={`day-card ${date === today ? "today" : ""}`}>
            <div className="day-header">
              <h2>{formatDayHeading(date)}</h2>
              <button className="btn ghost" onClick={() => onAddSlot(date)}>
                Add slot
              </button>
            </div>
            {slots.map((slot) => {
              const entries = entriesForSlot(data, date, slot.id);
              return (
                <div className="slot" key={slot.id}>
                  <div className="slot-head">
                    <strong>{slot.name}</strong>
                    {slots.length > 1 ? (
                      <button className="btn ghost" onClick={() => onRemoveSlot(date, slot.id)}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {entries.length === 0 ? (
                    <div className="empty-slot">Nothing planned yet</div>
                  ) : (
                    entries.map((entry) => {
                      const recipe = entry.recipeId ? recipeMap.get(entry.recipeId) : undefined;
                      const title =
                        entry.kind === "eating_out"
                          ? entry.eatingOutName || "Eating out"
                          : recipe?.name ?? "Recipe";
                      return (
                        <div className="meal-row" key={entry.id}>
                          <div>
                            <div className="meal-title">{title}</div>
                            <div className="muted">
                              {entry.kind === "eating_out"
                                ? "Eating out · macros can be added later"
                                : `${entry.portions} portion${entry.portions === 1 ? "" : "s"}`}
                            </div>
                          </div>
                          <button className="btn ghost" onClick={() => onRemoveMeal(entry.id)}>
                            Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                  <button className="btn" onClick={() => onAdd(date, slot.id)}>
                    Add meal
                  </button>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
