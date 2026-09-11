import { useMemo, useState } from "react";
import { TREAT_LABEL, isTreatRecipe } from "../data/recipeDraft";
import type { LeftoverBatch } from "../domain/planner";
import type { Recipe } from "../domain/types";

export function AddMealDialog({
  date,
  slotId,
  recipes,
  leftovers,
  onClose,
  onCook,
  onLeftover,
  onEatingOut,
}: {
  date: string;
  slotId: string;
  recipes: Recipe[];
  leftovers: LeftoverBatch[];
  onClose: () => void;
  onCook: (input: { recipeId: string; cookPortions: number; servePortions: number }) => void;
  onLeftover: (input: { cookBatchId: string; portions: number }) => void;
  onEatingOut: (name: string) => void;
}) {
  const [tab, setTab] = useState<"recipe" | "leftovers" | "out">("recipe");
  const [query, setQuery] = useState("");
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [servePortions, setServePortions] = useState(1);
  const [cookPortions, setCookPortions] = useState(1);
  const [leftoverId, setLeftoverId] = useState<string | null>(null);
  const [leftoverPortions, setLeftoverPortions] = useState(1);
  const [outName, setOutName] = useState("");

  const selected = recipes.find((recipe) => recipe.id === recipeId);
  const leftover = leftovers.find((item) => item.batch.id === leftoverId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter((recipe) => {
        if (!q) {
          return true;
        }
        return (
          recipe.name.toLowerCase().includes(q) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .slice(0, 12);
  }, [query, recipes]);

  function chooseRecipe(recipe: Recipe) {
    setRecipeId(recipe.id);
    setServePortions(1);
    setCookPortions(Math.max(1, recipe.servings));
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-labelledby="add-meal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">
          {date} · {slotId}
        </p>
        <h2 id="add-meal-title">Add a meal</h2>
        <div className="tabs">
          <button className={`chip ${tab === "recipe" ? "active" : ""}`} onClick={() => setTab("recipe")}>
            Cook recipe
          </button>
          <button
            className={`chip ${tab === "leftovers" ? "active" : ""}`}
            onClick={() => setTab("leftovers")}
          >
            Leftovers
          </button>
          <button className={`chip ${tab === "out" ? "active" : ""}`} onClick={() => setTab("out")}>
            Eating out
          </button>
        </div>

        {tab === "recipe" ? (
          <div className="form-grid">
            <input
              className="search"
              placeholder="Search recipes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="recipe-pick">
              {filtered.map((recipe) => (
                <button
                  key={recipe.id}
                  className={recipe.id === recipeId ? "selected" : undefined}
                  onClick={() => chooseRecipe(recipe)}
                >
                  <strong>{recipe.name}</strong>
                  <div className="muted">
                    Makes {recipe.servings} portions
                    {isTreatRecipe(recipe) ? ` · ${TREAT_LABEL}` : ""}
                  </div>
                </button>
              ))}
            </div>
            {selected ? (
              <>
                <label>
                  <span>Cook portions (shopping list uses this)</span>
                  <Stepper
                    value={cookPortions}
                    min={servePortions}
                    onChange={(value) => {
                      setCookPortions(value);
                      setServePortions((current) => Math.min(current, value));
                    }}
                  />
                </label>
                <div className="actions">
                  <button
                    className="chip"
                    onClick={() => setCookPortions(selected.servings)}
                  >
                    1x ({selected.servings})
                  </button>
                  <button
                    className="chip"
                    onClick={() => setCookPortions(selected.servings * 2)}
                  >
                    2x ({selected.servings * 2})
                  </button>
                </div>
                <label>
                  <span>Serve at this meal</span>
                  <Stepper
                    value={servePortions}
                    min={1}
                    max={cookPortions}
                    onChange={setServePortions}
                  />
                </label>
                <button
                  className="btn primary"
                  onClick={() =>
                    onCook({
                      recipeId: selected.id,
                      cookPortions,
                      servePortions,
                    })
                  }
                >
                  Add to plan
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {tab === "leftovers" ? (
          leftovers.length === 0 ? (
            <p className="muted">No leftover portions yet. Cook extra portions to use them later in the week — or next week.</p>
          ) : (
            <div className="form-grid">
              {leftovers.map((item) => (
                <button
                  key={item.batch.id}
                  className={`leftover-btn ${leftoverId === item.batch.id ? "selected" : ""}`}
                  onClick={() => {
                    setLeftoverId(item.batch.id);
                    setLeftoverPortions(Math.min(1, item.remaining));
                  }}
                >
                  <strong>{item.recipe.name}</strong>
                  <div className="muted">{item.remaining} portions left</div>
                </button>
              ))}
              {leftover ? (
                <>
                  <label>
                    <span>Portions for this meal</span>
                    <Stepper
                      value={leftoverPortions}
                      min={1}
                      max={leftover.remaining}
                      onChange={setLeftoverPortions}
                    />
                  </label>
                  <button
                    className="btn primary"
                    onClick={() =>
                      onLeftover({ cookBatchId: leftover.batch.id, portions: leftoverPortions })
                    }
                  >
                    Use leftovers
                  </button>
                </>
              ) : null}
            </div>
          )
        ) : null}

        {tab === "out" ? (
          <div className="form-grid">
            <label>
              <span>Where / what</span>
              <input
                value={outName}
                onChange={(event) => setOutName(event.target.value)}
                placeholder="Restaurant or meal name"
              />
            </label>
            <p className="muted">
              Eating out stays on the planner and off the shopping list. Self-reported macros can
              come later.
            </p>
            <button className="btn primary" onClick={() => onEatingOut(outName)}>
              Mark as eating out
            </button>
          </div>
        ) : null}

        <div className="actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  );
}
