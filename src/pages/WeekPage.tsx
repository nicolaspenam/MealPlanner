import { useMemo, useState } from "react";
import { addDays, formatWeekRange, startOfWeek, todayISO, weekDates } from "../domain/dates";
import { emptySlotsForWeek } from "../domain/randomFill";
import { useAppData, usePlannerStore, useResolvedRecipes } from "../state/storeContext";
import { WeekView } from "../components/WeekView";
import { AddMealDialog } from "../components/AddMealDialog";

export function WeekPage() {
  const store = usePlannerStore();
  const data = useAppData();
  const recipes = useResolvedRecipes();
  const today = todayISO();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(today, data.settings.weekStartsOn),
  );
  const [target, setTarget] = useState<{ date: string; slotId: string } | null>(null);
  const [fillMessage, setFillMessage] = useState<string | null>(null);

  const thisWeek = startOfWeek(today, data.settings.weekStartsOn);
  const dates = useMemo(() => weekDates(weekStart), [weekStart]);
  const emptyCount = useMemo(() => emptySlotsForWeek(data, dates).length, [data, dates]);

  function goToWeek(next: string) {
    setWeekStart(next);
    setFillMessage(null);
  }

  function surpriseRemaining() {
    const filled = store.fillRemainingWeek(dates);
    if (filled === 0) {
      setFillMessage("Every slot this week already has a meal.");
      return;
    }
    setFillMessage(
      `Filled ${filled} empty slot${filled === 1 ? "" : "s"} with healthy recipes, one portion each. Check the shopping list for this week.`,
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <p className="eyebrow">Weekly plan</p>
          <h1>{formatWeekRange(weekStart)}</h1>
        </div>
        <div className="week-nav">
          <button
            className="icon-btn"
            aria-label="Previous week"
            onClick={() => goToWeek(addDays(weekStart, -7))}
          >
            ‹
          </button>
          <button
            className="btn ghost"
            onClick={() => goToWeek(thisWeek)}
            disabled={weekStart === thisWeek}
          >
            This week
          </button>
          <button
            className="icon-btn"
            aria-label="Next week"
            onClick={() => goToWeek(addDays(weekStart, 7))}
          >
            ›
          </button>
        </div>
      </div>
      <div className="surprise-row">
        <button
          className="btn primary"
          disabled={emptyCount === 0}
          onClick={surpriseRemaining}
        >
          Surprise remaining meals
        </button>
        <p className="muted">
          {emptyCount === 0
            ? "Every slot this week already has a meal."
            : "Fills empty slots with random healthy recipes. Each cook is scaled to one portion so nothing is left over. Treats stay out of the mix."}
        </p>
      </div>
      {fillMessage ? <p className="status-note">{fillMessage}</p> : null}
      <WeekView
        dates={dates}
        today={today}
        data={data}
        recipes={recipes}
        onAdd={(date, slotId) => setTarget({ date, slotId })}
        onRemoveMeal={(id) => store.removeMeal(id)}
        onAddSlot={(date) => store.addDaySlot(date, "Snack")}
        onRemoveSlot={(date, slotId) => store.removeDaySlot(date, slotId)}
      />
      {target ? (
        <AddMealDialog
          date={target.date}
          slotId={target.slotId}
          recipes={recipes}
          leftovers={store.leftoverBatches()}
          onClose={() => setTarget(null)}
          onCook={(input) => {
            store.planNewBatch({ ...target, ...input });
            setTarget(null);
          }}
          onLeftover={(input) => {
            store.planLeftover({ ...target, ...input });
            setTarget(null);
          }}
          onEatingOut={(name) => {
            store.planEatingOut({ ...target, name });
            setTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}
