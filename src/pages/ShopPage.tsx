import { useMemo, useState } from "react";
import { AISLE_LABELS } from "../domain/aisles";
import { addDays, formatWeekRange, startOfWeek, todayISO } from "../domain/dates";
import { formatAmount } from "../domain/scaling";
import { buildShoppingList } from "../domain/shoppingList";
import { useAppData, usePlannerStore, useResolvedRecipes } from "../state/storeContext";

export function ShopPage() {
  const store = usePlannerStore();
  const data = useAppData();
  const recipes = useResolvedRecipes(true);
  const today = todayISO();
  const thisWeek = startOfWeek(today, data.settings.weekStartsOn);
  const [weekStart, setWeekStart] = useState(thisWeek);

  const items = useMemo(
    () => buildShoppingList(weekStart, data, recipes),
    [weekStart, data, recipes],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const list = map.get(item.aisle) ?? [];
      list.push(item);
      map.set(item.aisle, list);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <p className="eyebrow">Groceries</p>
          <h1>Shopping list</h1>
        </div>
        <div className="week-nav">
          <button className="icon-btn" onClick={() => setWeekStart((current) => addDays(current, -7))}>
            ‹
          </button>
          <button className="btn ghost" onClick={() => setWeekStart(thisWeek)}>
            This week
          </button>
          <button className="icon-btn" onClick={() => setWeekStart((current) => addDays(current, 7))}>
            ›
          </button>
        </div>
      </div>
      <p className="muted">
        {formatWeekRange(weekStart)}. Ingredients appear in the first week a cook batch is served,
        including extra portions you plan to eat later as leftovers.
      </p>
      {items.length === 0 ? (
        <div className="panel" style={{ marginTop: "1rem" }}>
          Nothing to buy this week. Plan a cook (not leftovers from a previous week) to fill this
          list.
        </div>
      ) : (
        groups.map(([aisle, group]) => (
          <section className="shop-group" key={aisle}>
            <h2>{AISLE_LABELS[group[0]!.aisle]}</h2>
            {group.map((item) => {
              const checked = store.isShoppingChecked(weekStart, item.key);
              const recipesLabel = [...new Set(item.sources.map((source) => source.recipeName))].join(
                ", ",
              );
              return (
                <label key={item.key} className={`shop-item ${checked ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => store.toggleShoppingItem(weekStart, item.key)}
                  />
                  <div>
                    <div className="meal-title">
                      {formatAmount(item.quantity, item.unit)} {item.name}
                    </div>
                    <div className="muted">{recipesLabel}</div>
                  </div>
                </label>
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}
