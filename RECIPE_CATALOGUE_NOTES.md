# ExpiryGuard recipe catalogue notes

## Implemented catalogue

The repository bundles **39 local recipes** in `src/data/recipes.ts`:

- **29 Indian recipes**
- **10 Italian recipes**

These entries are authored as part of the ExpiryGuard project and are marked in the data model as the `ExpiryGuard local catalogue`. Each entry has a stable ID, cuisine, dietary classification, ingredient quantities, ingredient keywords, cooking time, description, and preparation steps.

The local collection is the reliable offline and privacy-preserving source. The application does not claim to bundle thousands of recipes.

## Why a public multi-thousand dataset was not bundled

The Indian dataset repository reviewed for this change describes its collection as scraped and transformed from Archana’s Kitchen, but the repository page does not provide a clear redistribution licence for the original recipe text [1]. The RecipeNLG repository reports more than two million recipes, but also states that its published data contains material gathered from other datasets and does not provide a simple permissive redistribution licence for bundling its complete content in this public frontend [2]. A Kaggle Indian dataset page labels one collection CC0, but also identifies Archana’s Kitchen as the scraped source; that provenance is not enough to establish that every underlying recipe text and image may be redistributed in this application [3].

For those reasons, the project uses a smaller authored catalogue instead of copying a large scraped collection. This avoids making an unsupported licence or dataset-size claim.

## Optional online source

The recipe screen can request a small batch from **TheMealDB** through its official API endpoints. It does not download the entire provider database on launch. A user explicitly presses **Load online meals**; the app then requests at most 12 meal records, converts them to the local matching shape, displays the provider attribution and source link, and caches previously loaded results for seven days. The cache is bounded at 60 records.

TheMealDB documents official endpoints for meal search, category/area filtering, ingredient filtering, and detail lookup [4]. Its terms allow copying and modifying content returned from official endpoints, require copyright/trademark notices to remain intact, and state that free API use is for development projects while app-store publication requires a paid subscription [5]. ExpiryGuard therefore treats this as an on-demand, best-effort web source for the GitHub Pages PWA, not as a bundled or guaranteed catalogue. The user’s local pantry is not uploaded to the source.

At the time of implementation checks, the provider returned 21 summaries for the `Italian` area filter and 0 for the `Indian` area filter. Search and provider coverage can change. The local Indian catalogue remains the primary source for Indian matching.

## Matching guarantees

Recipe matching is performed on-device. It normalizes ingredient tokens and uses explicit singular/plural and regional aliases rather than unsafe arbitrary substring matching. Expired inventory items are excluded. Ingredients expiring today or within five days increase ranking priority. Each result shows a match percentage, cuisine, cooking time, available ingredients, missing ingredients, preparation steps, and source when present.

The recipe screen supports name/ingredient search and renders nine cards initially. **Show more recipes** incrementally adds nine cards at a time, so a larger cached catalogue does not render every card in one pass. Online loading has skeleton feedback, an error message, and a local/offline fallback.

## References

[1]: https://github.com/kanishk307/IndianFoodDatasetGeneration "IndianFoodDatasetGeneration repository"
[2]: https://github.com/glorf/recipenlg "RecipeNLG repository"
[3]: https://www.kaggle.com/datasets/kishanpahadiya/indian-food-and-its-recipes-dataset-with-images "Indian Food and Its Recipes Dataset page"
[4]: https://www.themealdb.com/api.php "TheMealDB free API documentation"
[5]: https://www.themealdb.com/terms_of_use.php "TheMealDB terms of use"
