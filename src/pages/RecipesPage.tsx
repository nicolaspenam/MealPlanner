import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRecipeTag } from "../data/recipeDraft";
import { useResolvedRecipes } from "../state/storeContext";

export function RecipesPage() {
  const recipes = useResolvedRecipes();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const recipe of recipes) {
      for (const item of recipe.tags) {
        set.add(item);
      }
    }
    return ["all", ...[...set].sort()];
  }, [recipes]);

  const filtered = recipes.filter((recipe) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      recipe.name.toLowerCase().includes(q) ||
      recipe.description.toLowerCase().includes(q);
    const matchesTag = tag === "all" || recipe.tags.includes(tag);
    return matchesQuery && matchesTag;
  });

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Recipes</h1>
        </div>
        <Link className="btn primary" to="/recipes/new">
          New recipe
        </Link>
      </div>
      <input
        className="search"
        placeholder="Search recipes"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="tags chip-row">
        {tags.map((item) => (
          <button
            key={item}
            className={`chip ${tag === item ? "active" : ""} ${item === "treat" ? "treat" : ""}`}
            onClick={() => setTag(item)}
          >
            {item === "all" ? "all" : formatRecipeTag(item)}
          </button>
        ))}
      </div>
      <div className="recipe-grid">
        {filtered.map((recipe) => (
          <Link className="recipe-card" key={recipe.id} to={`/recipes/${recipe.id}`}>
            <strong>{recipe.name}</strong>
            <div className="muted">{recipe.servings} portions</div>
            <p className="muted">{recipe.description}</p>
            <div className="tags">
              {recipe.tags.map((item) => (
                <span className={`tag ${item === "treat" ? "treat" : ""}`} key={item}>
                  {formatRecipeTag(item)}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
