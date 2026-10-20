export type Category = 'Dairy' | 'Bakery' | 'Produce' | 'Meat' | 'Pantry' | 'Frozen' | 'Other'
export type Location = 'Fridge' | 'Freezer' | 'Pantry'
export type ItemStatus = 'expired' | 'today' | 'soon' | 'amber' | 'fresh'
export type ThemePreference = 'system' | 'light' | 'dark'
export type Page = 'home' | 'inventory' | 'recipes' | 'insights' | 'settings'
export type RecipeDiet = 'vegetarian' | 'non-vegetarian'
export type RecipeCuisine = 'Indian' | 'Italian'

export interface FoodItem {
  id: string
  name: string
  category: Category
  quantity: number
  unit: string
  expiryDate: string
  location: Location
  notes: string
  imageUrl?: string
  barcode?: string
  createdAt: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  cuisine: RecipeCuisine
  diet: RecipeDiet
  source?: string
  sourceUrl?: string
  cookingTime: string
  prepMinutes: number
  ingredientsUsed: string[]
  extraIngredients: string[]
  steps: string[]
  ingredientQuantities: string[]
  availableIngredients?: string[]
  missingIngredients?: string[]
  expiringIngredients?: string[]
  matchPercentage?: number
}

export interface AppState {
  items: FoodItem[]
  usedCount: number
  wastedCount: number
  theme: ThemePreference
  notificationLead: number
  demoOffset: number
  recipes: Recipe[]
}

export interface AppToast {
  id: string
  message: string
  tone?: 'default' | 'success' | 'error'
  actionLabel?: string
  onAction?: () => void
}
