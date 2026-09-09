import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AISLES, INGREDIENT_UNITS, type Ingredient, type Recipe } from "../domain/types";
import { createId } from "../domain/ids";
import { forkBuiltin, newCustomRecipe } from "../storage/store";
import { usePlannerStore, useResolvedRecipes } from "../state/storeContext";

export function RecipeEditPage({ mode }: { mode: "new" | "edit" }) {
  const { recipeId } = useParams();
  const store = usePlannerStore();
  const recipes = useResolvedRecipes();
  const navigate = useNavigate();
  const existing = recipes.find((item) => item.id === recipeId);
  const [error, setError] = useState<string | null>(null);

  const initial = useMemo(() => {
    if (mode === "new") {
      return newCustomRecipe();
    }
    if (!existing) {
      return null;
    }
    return existing.source === "builtin" ? forkBuiltin(existing) : existing;
  }, [existing, mode]);

  const [recipe, setRecipe] = useState<Recipe | null>(initial);

  if (!recipe) {
    return (
      <div className="page">
        <h1>Recipe not found</h1>
        <Link to="/recipes">Back</Link>
      </div>
    );
  }

  function update(patch: Partial<Recipe>) {
    setRecipe((current) => (current ? { ...current, ...patch } : current));
  }

  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    setRecipe((current) =>
      current
        ? {
            ...current,
            ingredients: current.ingredients.map((ingredient) =>
              ingredient.id === id ? { ...ingredient, ...patch } : ingredient,
            ),
          }
        : current,
    );
  }

  return (
    <div className="page">
      <p className="eyebrow">{mode === "new" ? "Create" : "Edit"}</p>
      <h1>{mode === "new" ? "New recipe" : recipe.name || "Edit recipe"}</h1>
      <div className="form-grid panel">
        <label>
          <span>Name</span>
          <input
            value={recipe.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>
        <label>
          <span>Description</span>
          <textarea
            rows={3}
            value={recipe.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </label>
        <label>
          <span>Portions this recipe creates</span>
          <input
            type="number"
            min={1}
            value={recipe.servings}
            onChange={(event) => update({ servings: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>Tags (comma separated)</span>
          <input
            value={recipe.tags.join(", ")}
            onChange={(event) =>
              update({
                tags: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <div className="stack-sm">
          <div className="field-label">Ingredients</div>
          {recipe.ingredients.map((ingredient) => (
            <div className="ingredient-row" key={ingredient.id}>
              <input
                placeholder="Name"
                value={ingredient.name}
                onChange={(event) => updateIngredient(ingredient.id, { name: event.target.value })}
              />
              <input
                type="number"
                min={0}
                step="any"
                value={ingredient.quantity}
                onChange={(event) =>
                  updateIngredient(ingredient.id, { quantity: Number(event.target.value) })
                }
              />
              <select
                value={ingredient.unit}
                onChange={(event) =>
                  updateIngredient(ingredient.id, {
                    unit: event.target.value as Ingredient["unit"],
                  })
                }
              >
                {INGREDIENT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <select
                value={ingredient.aisle}
                onChange={(event) =>
                  updateIngredient(ingredient.id, {
                    aisle: event.target.value as Ingredient["aisle"],
                  })
                }
              >
                {AISLES.map((aisle) => (
                  <option key={aisle} value={aisle}>
                    {aisle}
                  </option>
                ))}
              </select>
              <button
                className="btn ghost"
                onClick={() =>
                  setRecipe((current) =>
                    current
                      ? {
                          ...current,
                          ingredients: current.ingredients.filter((item) => item.id !== ingredient.id),
                        }
                      : current,
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="btn"
            onClick={() =>
              setRecipe((current) =>
                current
                  ? {
                      ...current,
                      ingredients: [
                        ...current.ingredients,
                        {
                          id: createId("ing"),
                          name: "",
                          quantity: 1,
                          unit: "g",
                          aisle: "produce",
                        },
                      ],
                    }
                  : current,
              )
            }
          >
            Add ingredient
          </button>
        </div>
        {error ? <p className="muted">{error}</p> : null}
        <div className="actions">
          <button
            className="btn primary"
            onClick={() => {
              const next = { ...recipe, updatedAt: new Date().toISOString() };
              const errors = store.upsertRecipe(next);
              if (errors.length > 0) {
                setError(errors[0] ?? "Could not save");
                return;
              }
              navigate(`/recipes/${next.id}`);
            }}
          >
            Save recipe
          </button>
          <Link className="btn ghost" to={mode === "new" ? "/recipes" : `/recipes/${recipe.id}`}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
