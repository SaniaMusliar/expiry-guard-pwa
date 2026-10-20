import type { FoodItem, RecipeCuisine, RecipeDiet } from '../types'
import type { RecipeFilters } from './recipes'
import { daysUntil } from './expiry'

const STORAGE_KEY = 'expiryguard-openrouter-key-v1'
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

export function loadOpenRouterKey() {
  try { return localStorage.getItem(STORAGE_KEY) ?? '' } catch { return '' }
}

export function saveOpenRouterKey(value: string) {
  try {
    const key = value.trim()
    if (key) localStorage.setItem(STORAGE_KEY, key)
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* local persistence is best-effort */ }
}

type AskArgs = {
  apiKey: string
  question: string
  items: FoodItem[]
  offset: number
  filters: RecipeFilters
  localRecipeTitles: string[]
}

type OpenRouterResponse = { choices?: Array<{ message?: { content?: string | null } }>; error?: { message?: string } }

function preferenceText(filters: RecipeFilters) {
  const cuisine = filters.cuisine === 'all' ? 'any cuisine' : `${filters.cuisine} cuisine`
  const diet = filters.diet === 'all' ? 'any dietary style' : filters.diet
  const time = filters.maxMinutes === 'all' ? 'any cooking time' : `at most ${filters.maxMinutes} minutes`
  return `${cuisine}; ${diet}; ${time}; ${filters.expiringOnly ? 'prioritise ingredients expiring within five days' : 'use expiry urgency when it helps'}`
}

export async function askOpenRouter({ apiKey, question, items, offset, filters, localRecipeTitles }: AskArgs) {
  const key = apiKey.trim()
  if (!key) throw new Error('Add your OpenRouter API key in Settings to use Ask AI. Local recipe search still works without it.')
  if (!question.trim()) throw new Error('Type a cooking question first.')

  const inventory = items.map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit, location: item.location, expiryDate: item.expiryDate, daysUntilExpiry: daysUntil(item.expiryDate, offset) }))
  const prompt = [
    `User question: ${question.trim()}`,
    `Preferences: ${preferenceText(filters)}`,
    'Active pantry inventory (items with daysUntilExpiry below 0 are expired and must not be recommended):',
    JSON.stringify(inventory),
    `Built-in recipe titles that can be used as grounded options: ${localRecipeTitles.join(', ')}`,
  ].join('\n')

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openrouter/free',
        temperature: 0.35,
        max_tokens: 500,
        messages: [
          { role: 'system', content: 'You are ExpiryGuard Smart Recipe Search. Give practical, concise recipe guidance grounded in the supplied pantry. Never recommend or imply that expired food is safe; explicitly tell the user to discard or inspect expired items instead. Do not claim an ingredient is available unless it appears in the pantry. Respect cuisine, diet, and time preferences. Mention missing ingredients when useful. The answer is advice, not a food-safety certification.' },
          { role: 'user', content: prompt },
        ],
      }),
    })
  } catch { throw new Error('OpenRouter could not be reached. Check your connection, or continue with local recipe search.') }

  let data: OpenRouterResponse = {}
  try { data = await response.json() as OpenRouterResponse } catch { /* handled below */ }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('OpenRouter rejected this key. Check it in Settings or create a new key.')
    if (response.status === 402 || response.status === 429) throw new Error('The free model is at its limit right now. Try again later or continue with local recipe search.')
    throw new Error(data.error?.message || 'The OpenRouter request failed. Local recipe search is still available.')
  }
  const answer = data.choices?.[0]?.message?.content?.trim()
  if (!answer) throw new Error('The free model returned no answer. Please try again or use local recipe search.')
  return answer
}

export type { RecipeCuisine, RecipeDiet }
