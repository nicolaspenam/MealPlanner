import { useEffect, useRef, useState } from "react";
import { monthDay, weekdayShort } from "../domain/dates";
import {
  entriesForSlot,
  mealTitle,
  slotOnDateByName,
  slotRowsForWeek,
  slotsForDate,
} from "../domain/planner";
import type { AppData, MealEntry, Recipe } from "../domain/types";

export function WeekCalendarView({
  dates,
  today,
  data,
  recipes,
  onAdd,
  onRemoveMeal,
  onAddSlot,
  onRemoveSlot,
  onEnsureAndAdd,
}: {
  dates: string[];
  today: string;
  data: AppData;
  recipes: Recipe[];
  onAdd: (date: string, slotId: string) => void;
  onRemoveMeal: (mealId: string) => void;
  onRemoveSlot: (date: string, slotId: string) => void;
  onAddSlot: (date: string) => void;
  onEnsureAndAdd: (date: string, slotName: string) => void;
}) {
  const rows = slotRowsForWeek(data, dates);
  const [peek, setPeek] = useState<{
    date: string;
    slotId: string;
    slotName: string;
    entry: MealEntry;
  } | null>(null);

  return (
    <>
      <div className="week-calendar-scroll">
        <table className="week-calendar">
          <thead>
            <tr>
              <th className="cal-corner" scope="col">
                Meal
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  scope="col"
                  className={date === today ? "cal-today" : undefined}
                >
                  <div className="cal-day-head">
                    <span className="cal-weekday">{weekdayShort(date)}</span>
                    <span className="cal-date">{monthDay(date)}</span>
                    <button
                      type="button"
                      className="cal-add-slot"
                      aria-label={`Add a slot on ${weekdayShort(date)}`}
                      onClick={() => onAddSlot(date)}
                    >
                      +
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                {dates.map((date) => {
                  const slot = slotOnDateByName(data, date, row.name);
                  const entries = slot ? entriesForSlot(data, date, slot.id) : [];
                  return (
                    <td
                      key={`${date}-${row.id}`}
                      className={date === today ? "cal-today" : undefined}
                    >
                      {slot && entries.length > 0 ? (
                        <div className="cal-events">
                          {entries.map((entry) => (
                            <button
                              type="button"
                              key={entry.id}
                              className={`cal-event ${entry.kind === "eating_out" ? "out" : ""}`}
                              onClick={() =>
                                setPeek({
                                  date,
                                  slotId: slot.id,
                                  slotName: slot.name,
                                  entry,
                                })
                              }
                            >
                              <span className="cal-event-title">{mealTitle(entry, recipes)}</span>
                              <span className="cal-event-meta">
                                {entry.kind === "eating_out"
                                  ? "Out"
                                  : `${entry.portions}p`}
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            className="cal-add-more"
                            aria-label={`Add another ${row.name} on ${weekdayShort(date)}`}
                            onClick={() => onAdd(date, slot.id)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cal-empty"
                          aria-label={`Add ${row.name} on ${weekdayShort(date)}`}
                          onClick={() => {
                            if (slot) {
                              onAdd(date, slot.id);
                              return;
                            }
                            onEnsureAndAdd(date, row.name);
                          }}
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {peek ? (
        <MealPeek
          date={peek.date}
          slotName={peek.slotName}
          entry={peek.entry}
          recipes={recipes}
          canRemoveSlot={slotsForDate(data, peek.date).length > 1}
          onClose={() => setPeek(null)}
          onRemoveMeal={() => {
            onRemoveMeal(peek.entry.id);
            setPeek(null);
          }}
          onAddAnother={() => {
            const slotId = peek.slotId;
            const date = peek.date;
            setPeek(null);
            onAdd(date, slotId);
          }}
          onRemoveSlot={() => {
            onRemoveSlot(peek.date, peek.slotId);
            setPeek(null);
          }}
        />
      ) : null}
    </>
  );
}

function MealPeek({
  date,
  slotName,
  entry,
  recipes,
  canRemoveSlot,
  onClose,
  onRemoveMeal,
  onAddAnother,
  onRemoveSlot,
}: {
  date: string;
  slotName: string;
  entry: MealEntry;
  recipes: Recipe[];
  canRemoveSlot: boolean;
  onClose: () => void;
  onRemoveMeal: () => void;
  onAddAnother: () => void;
  onRemoveSlot: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog meal-peek"
        role="dialog"
        aria-labelledby="meal-peek-title"
        ref={dialogRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">
          {weekdayShort(date)} · {slotName}
        </p>
        <h2 id="meal-peek-title">{mealTitle(entry, recipes)}</h2>
        <p className="muted">
          {entry.kind === "eating_out"
            ? "Eating out · macros can be added later"
            : `${entry.portions} portion${entry.portions === 1 ? "" : "s"}`}
        </p>
        <div className="actions">
          <button className="btn danger" onClick={onRemoveMeal}>
            Remove meal
          </button>
          <button className="btn" onClick={onAddAnother}>
            Add another
          </button>
          {canRemoveSlot ? (
            <button className="btn ghost" onClick={onRemoveSlot}>
              Remove {slotName.toLowerCase()} slot
            </button>
          ) : null}
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
