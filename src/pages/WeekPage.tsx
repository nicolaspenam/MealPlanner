import { useMemo, useState } from "react";
import { addDays, formatWeekRange, startOfWeek, todayISO, weekDates } from "../domain/dates";
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

  const thisWeek = startOfWeek(today, data.settings.weekStartsOn);
  const dates = useMemo(() => weekDates(weekStart), [weekStart]);

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
            onClick={() => setWeekStart((current) => addDays(current, -7))}
          >
            ‹
          </button>
          <button
            className="btn ghost"
            onClick={() => setWeekStart(thisWeek)}
            disabled={weekStart === thisWeek}
          >
            This week
          </button>
          <button
            className="icon-btn"
            aria-label="Next week"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
          >
            ›
          </button>
        </div>
      </div>
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
