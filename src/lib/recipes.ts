import { OFFLINE_RECIPES, type PantryRecipe } from '../data/recipes'
import { daysUntil } from './expiry'
import type { FoodItem, Recipe, RecipeCuisine, RecipeDiet } from '../types'

export interface RecipeFilters { diet: 'all' | RecipeDiet; cuisine: 'all' | RecipeCuisine; maxMinutes: 'all' | 15 | 30 | 45; expiringOnly: boolean }

const aliases: Record<string, string[]> = {
  egg: ['egg', 'eggs'], tomato: ['tomato', 'tomatoes'], potato: ['potato', 'potatoes'], onion: ['onion', 'onions'], pea: ['pea', 'peas'], chickpea: ['chickpea', 'chickpeas', 'chana'], dal: ['dal', 'dhal', 'lentil', 'lentils'], bean: ['bean', 'beans'], vegetable: ['vegetable', 'vegetables', 'mixed vegetables'], rice: ['rice', 'basmati', 'arborio'], pasta: ['pasta', 'spaghetti', 'penne'], flour: ['flour', 'wheat flour'], garlic: ['garlic', 'garlic cloves'], basil: ['basil'], parmesan: ['parmesan'], mozzarella: ['mozzarella'], mushroom: ['mushroom', 'mushrooms'], yogurt: ['yogurt', 'curd'], peanut: ['peanut', 'peanuts'], curry: ['curry leaf', 'curry leaves'], mustard: ['mustard', 'mustard seeds'], chilli: ['chilli', 'chili'], carrot: ['carrot', 'carrots'], spinach: ['spinach'], paneer: ['paneer'], chicken: ['chicken'], fish: ['fish'], poha: ['poha'], semolina: ['semolina', 'sooji', 'upma'], lemon: ['lemon', 'lemons'], coriander: ['coriander', 'cilantro'], cashew: ['cashew', 'cashews'], coconut: ['coconut'], olive: ['olive oil', 'olives'], stock: ['stock', 'broth'], bread: ['bread', 'loaf'], apple: ['apple', 'apples'], banana: ['banana', 'bananas'], fruit: ['fruit', 'fruits'], garam: ['garam masala'], cumin: ['cumin'], pepper: ['pepper', 'black pepper'], ginger: ['ginger', 'ginger garlic'], eggplant: ['eggplant', 'aubergine'], idli: ['idli'], dosa: ['dosa'], rajma: ['rajma', 'kidney bean'], okra: ['okra', 'bhindi'], biryani: ['biryani'], pizza: ['pizza'], dough: ['dough'], butter: ['butter'], riceflake: ['poha'],
}

function tokens(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean) }
function phraseMatches(haystack: string[], needle: string[]) { if (!needle.length || needle.length > haystack.length) return false; for (let index = 0; index <= haystack.length - needle.length; index += 1) if (needle.every((token, offset) => haystack[index + offset] === token)) return true; return false }
function ingredientMatches(item: Pick<FoodItem, 'name'>, keyword: string) { const itemTokens = tokens(item.name); const choices = aliases[keyword] ?? [keyword]; return choices.some((choice) => phraseMatches(itemTokens, tokens(choice))) }
function urgencyBoost(days: number) { return days <= 0 ? 12 : days <= 2 ? 9 : days <= 5 ? 5 : 0 }

export function searchRecipes(recipes: PantryRecipe[], query: string) {
  const normalized = tokens(query).join(' ')
  if (!normalized) return recipes
  return recipes.filter((recipe) => tokens(`${recipe.title} ${recipe.description} ${recipe.ingredientKeywords.join(' ')} ${recipe.ingredientQuantities.join(' ')}`).join(' ').includes(normalized))
}

export function rankRecipes(recipes: PantryRecipe[], items: FoodItem[], offset: number, filters: RecipeFilters): Recipe[] {
  const activeItems = items.filter((item) => daysUntil(item.expiryDate, offset) >= 0)
  const expiringItems = activeItems.filter((item) => daysUntil(item.expiryDate, offset) <= 5)
  const sourceItems = filters.expiringOnly ? expiringItems : activeItems
  return recipes
    .filter((recipe) => filters.diet === 'all' || recipe.diet === filters.diet)
    .filter((recipe) => filters.cuisine === 'all' || recipe.cuisine === filters.cuisine)
    .filter((recipe) => filters.maxMinutes === 'all' || recipe.prepMinutes <= filters.maxMinutes)
    .map((recipe) => {
      const availableKeywords = recipe.ingredientKeywords.filter((keyword) => sourceItems.some((item) => ingredientMatches(item, keyword)))
      const expiringKeywords = recipe.ingredientKeywords.filter((keyword) => expiringItems.some((item) => ingredientMatches(item, keyword)))
      const missingIngredients = recipe.ingredientQuantities.filter((ingredient) => !availableKeywords.some((keyword) => ingredientMatches({ name: ingredient }, keyword)))
      const urgency = expiringItems.filter((item) => expiringKeywords.some((keyword) => ingredientMatches(item, keyword))).reduce((total, item) => total + urgencyBoost(daysUntil(item.expiryDate, offset)), 0)
      const matchPercentage = Math.round((availableKeywords.length / recipe.ingredientKeywords.length) * 100)
      return { recipe, availableKeywords, expiringKeywords, missingIngredients, matchPercentage, score: matchPercentage * 2 + urgency }
    })
    .filter((entry) => entry.availableKeywords.length > 0)
    .sort((a, b) => b.score - a.score || b.matchPercentage - a.matchPercentage || a.recipe.prepMinutes - b.recipe.prepMinutes)
    .map(({ recipe, availableKeywords, expiringKeywords, missingIngredients, matchPercentage }) => ({
      ...recipe,
      ingredientsUsed: recipe.ingredientQuantities.filter((ingredient) => availableKeywords.some((keyword) => ingredientMatches({ name: ingredient }, keyword))),
      extraIngredients: missingIngredients,
      availableIngredients: availableKeywords,
      missingIngredients,
      expiringIngredients: expiringKeywords,
      matchPercentage,
    }))
}

export function matchOfflineRecipes(items: FoodItem[], offset: number, filters: RecipeFilters) { return rankRecipes(OFFLINE_RECIPES, items, offset, filters).slice(0, 8) }

export type { PantryRecipe }
