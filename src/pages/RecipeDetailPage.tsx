import { Link, useNavigate, useParams } from "react-router-dom";
import { formatRecipeTag, isTreatRecipe } from "../data/recipeDraft";
import { formatAmount } from "../domain/scaling";
import { usePlannerStore, useResolvedRecipes } from "../state/storeContext";

export function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const store = usePlannerStore();
  const recipes = useResolvedRecipes();
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    return (
      <div className="page">
        <h1>Recipe not found</h1>
        <Link to="/recipes">Back to recipes</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <p className="eyebrow">{recipe.source === "builtin" ? "Built-in" : "Your recipe"}</p>
      <h1>{recipe.name}</h1>
      <p className="muted">{recipe.description}</p>
      <p>Makes {recipe.servings} portions</p>
      {isTreatRecipe(recipe) ? (
        <p className="treat-banner">
          Yummy treat — a more indulgent option, not one of the everyday healthy meals.
        </p>
      ) : null}
      <div className="tags" style={{ margin: "0.8rem 0 1rem" }}>
        {recipe.tags.map((tag) => (
          <span className={`tag ${tag === "treat" ? "treat" : ""}`} key={tag}>
            {formatRecipeTag(tag)}
          </span>
        ))}
      </div>
      <div className="panel">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {formatAmount(ingredient.quantity, ingredient.unit)} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>
      {(recipe.instructions ?? []).length > 0 ? (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2>Instructions</h2>
          <ol className="instructions">
            {(recipe.instructions ?? []).map((step, index) => (
              <li key={`${recipe.id}-step-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No instructions yet. Edit the recipe to add steps that work for you.
        </p>
      )}
      <div className="actions">
        <Link className="btn primary" to={`/recipes/${recipe.id}/edit`}>
          Edit
        </Link>
        <button
          className="btn danger"
          onClick={() => {
            store.archiveRecipe(recipe.id);
            navigate("/recipes");
          }}
        >
          Remove from catalog
        </button>
        <Link className="btn ghost" to="/recipes">
          Back
        </Link>
      </div>
    </div>
  );
}
