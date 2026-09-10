import type { Aisle, IngredientUnit, Recipe } from "../domain/types";

export const TREAT_TAG = "treat";
export const TREAT_LABEL = "Yummy treat";

export function formatRecipeTag(tag: string): string {
  return tag === TREAT_TAG ? TREAT_LABEL : tag;
}

export interface IngredientDraft {
  name: string;
  quantity: number;
  unit: IngredientUnit;
  aisle: Aisle;
}

export interface RecipeDraft {
  id: string;
  name: string;
  description: string;
  servings: number;
  tags: string[];
  ingredients: IngredientDraft[];
  instructions?: string[];
}

const STAMP = "2026-01-01T00:00:00.000Z";

export function recipeFromDraft(draft: RecipeDraft): Recipe {
  return {
    id: draft.id,
    builtinId: draft.id,
    name: draft.name,
    description: draft.description,
    servings: draft.servings,
    tags: draft.tags,
    source: "builtin",
    ingredients: draft.ingredients.map((item, index) => ({
      id: `${draft.id}-ing-${index + 1}`,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      aisle: item.aisle,
    })),
    instructions: [...(draft.instructions ?? [])],
    updatedAt: STAMP,
  };
}

export function isTreatRecipe(recipe: Pick<Recipe, "tags">): boolean {
  return recipe.tags.includes(TREAT_TAG);
}
