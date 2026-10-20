import type { RecipeCuisine } from '../types'
import type { PantryRecipe } from '../data/recipes'

const API_ROOT = 'https://www.themealdb.com/api/json/v1/1'
const CACHE_KEY = 'expiryguard-online-recipes-v1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const MAX_RESULTS_PER_REQUEST = 12
const MAX_CACHED_RECIPES = 60

type MealSummary = { idMeal: string; strMeal: string; strMealThumb?: string }
type MealDetail = MealSummary & { strArea?: string; strCategory?: string; strInstructions?: string; strSource?: string; [key: string]: string | undefined }

function isRecipe(value: unknown): value is PantryRecipe { if (!value || typeof value !== 'object') return false; const recipe = value as Partial<PantryRecipe>; return typeof recipe.id === 'string' && typeof recipe.title === 'string' && (recipe.cuisine === 'Indian' || recipe.cuisine === 'Italian') && Array.isArray(recipe.ingredientKeywords) && Array.isArray(recipe.ingredientQuantities) && Array.isArray(recipe.steps) }
function parseCache() { try { const value = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as { savedAt?: number; recipes?: unknown[] }; if (!value.savedAt || Date.now() - value.savedAt > CACHE_TTL || !Array.isArray(value.recipes)) return []; return value.recipes.filter(isRecipe) } catch { return [] } }
export function loadCachedOnlineRecipes() { return parseCache() }
function saveCache(recipes: PantryRecipe[]) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), recipes: recipes.slice(0, MAX_CACHED_RECIPES) })) } catch { /* local caching is best-effort */ } }
async function getJson<T>(url: string): Promise<T> { const response = await fetch(url); if (!response.ok) throw new Error(`Recipe source returned ${response.status}.`); return response.json() as Promise<T> }
function inferDiet(ingredients: string[]) { return ingredients.some((ingredient) => /chicken|beef|pork|lamb|mutton|fish|prawn|shrimp|tuna|salmon|anchov|meat/i.test(ingredient)) ? 'non-vegetarian' as const : 'vegetarian' as const }
function toPantryRecipe(meal: MealDetail, cuisine: RecipeCuisine): PantryRecipe | null {
  const ingredients = Array.from({ length: 20 }, (_, index) => meal[`strIngredient${index + 1}`]?.trim() ?? '').filter(Boolean)
  const quantities = ingredients.map((ingredient, index) => `${meal[`strMeasure${index + 1}`]?.trim() || ''} ${ingredient}`.trim())
  if (!meal.idMeal || !meal.strMeal || ingredients.length === 0 || !meal.strInstructions) return null
  const steps = meal.strInstructions.split(/\r?\n+/).map((step) => step.replace(/^\s*(?:\d+[.)]|[-•])\s*/, '').trim()).filter(Boolean).slice(0, 12)
  return { id: `themealdb-${meal.idMeal}`, title: meal.strMeal, description: `${meal.strArea || cuisine} ${meal.strCategory || 'meal'} from TheMealDB.`, cuisine, diet: inferDiet(ingredients), source: 'TheMealDB', sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`, cookingTime: 'See source', prepMinutes: 30, ingredientQuantities: quantities, ingredientKeywords: ingredients.map((ingredient) => ingredient.toLowerCase()), steps, ingredientsUsed: [], extraIngredients: [] }
}

export async function fetchOnlineRecipes(cuisine: RecipeCuisine, query = '') {
  const encodedQuery = encodeURIComponent(query.trim())
  let summaries: MealSummary[] = []
  if (encodedQuery) {
    const searched = await getJson<{ meals: MealDetail[] | null }>(`${API_ROOT}/search.php?s=${encodedQuery}`)
    const meals = searched.meals ?? []
    summaries = meals.filter((meal) => !meal.strArea || meal.strArea.toLowerCase() === cuisine.toLowerCase()).slice(0, MAX_RESULTS_PER_REQUEST)
  } else {
    const filtered = await getJson<{ meals: MealSummary[] | null }>(`${API_ROOT}/filter.php?a=${encodeURIComponent(cuisine)}`)
    summaries = (filtered.meals ?? []).slice(0, MAX_RESULTS_PER_REQUEST)
  }
  const details = await Promise.all(summaries.map((summary) => getJson<{ meals: MealDetail[] | null }>(`${API_ROOT}/lookup.php?i=${summary.idMeal}`)))
  const fetched = details.map((result) => result.meals?.[0] ? toPantryRecipe(result.meals[0], cuisine) : null).filter((recipe): recipe is PantryRecipe => Boolean(recipe))
  const merged = [...fetched, ...parseCache()].filter((recipe, index, recipes) => recipes.findIndex((candidate) => candidate.id === recipe.id) === index)
  saveCache(merged)
  return { recipes: merged, fetchedCount: fetched.length, provider: 'TheMealDB' as const }
}

export const onlineRecipeLimits = { maxResultsPerRequest: MAX_RESULTS_PER_REQUEST, maxCachedRecipes: MAX_CACHED_RECIPES }
