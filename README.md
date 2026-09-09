# Meal Planner

An installable PWA for planning the week’s meals and turning them into a grocery list. Data stays on the device, with JSON export/import for moving to a new phone.

**Live app:** [https://nicolaspenam.github.io/MealPlanner/](https://nicolaspenam.github.io/MealPlanner/)

## What it does now

- Weekly planner (Monday by default) for the current week or any later week
- Default slots: breakfast, lunch, dinner, plus extra slots such as snacks
- Built-in healthy recipes (omnivore and vegetarian) with ingredients, units, and portion counts
- Create and edit recipes, including overlays on the built-in catalog
- Cook extra portions and assign leftovers to later days or weeks
- Eating-out meals (no shopping impact; macros can be self-reported later)
- Shopping list for a week, scaled by how many portions you cook
- Leftovers from a previous week do not appear on this week’s list
- Local storage plus backup export/import

Cooking instructions and per-portion macros are deferred on purpose.

## Shopping-list rule

A **cook batch** is one scaled cook of a recipe (for example chili × 6 portions). Groceries for that batch appear only in the **first week a portion is served**. Later leftover servings reuse the same batch and do not add ingredients again. Cooking the same recipe again creates a new batch and a new shop.

Scaling is portion-based: a recipe that makes 2 can be logged as 4 portions (2×), and the list doubles the ingredients.

## Develop

```bash
npm install
npm test
npm run dev
```

The Vite dev server is at [http://127.0.0.1:5173/MealPlanner/](http://127.0.0.1:5173/MealPlanner/) because the production site lives under that GitHub Pages path.

Build a production PWA with `npm run build`. Preview the built files with `npm run preview`, then open [http://127.0.0.1:4173/MealPlanner/](http://127.0.0.1:4173/MealPlanner/).

## GitHub Pages

The app is a Vite build. GitHub Pages cannot run TypeScript from `src/`, so publishing the `main` branch root produces a blank page: the served `index.html` asks the browser for `/src/main.tsx`, which is not a compiled bundle.

This repo deploys the `dist/` output with a GitHub Actions workflow (`.github/workflows/deploy.yml`) on every push to `main`.

**One-time setting:** in the repo, open **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”). After that, each merge to `main` publishes [https://nicolaspenam.github.io/MealPlanner/](https://nicolaspenam.github.io/MealPlanner/).
