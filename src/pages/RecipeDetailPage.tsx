import { Link, useNavigate, useParams } from "react-router-dom";
import { formatQuantity } from "../domain/scaling";
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
      <div className="tags" style={{ margin: "0.8rem 0 1rem" }}>
        {recipe.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="panel">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {formatQuantity(ingredient.quantity)} {ingredient.unit} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>
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
