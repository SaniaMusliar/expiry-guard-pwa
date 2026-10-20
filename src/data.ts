import type { FoodItem } from './types'

export function isoFromToday(days: number, offset = 0) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days + offset)
  return date.toISOString().slice(0, 10)
}

export function createDemoItems(offset = 0): FoodItem[] {
  const createdAt = new Date().toISOString()
  return [
    { id: 'demo-milk', name: 'Organic oat milk', category: 'Dairy', quantity: 1, unit: 'carton', expiryDate: isoFromToday(0, offset), location: 'Fridge', notes: 'Open — use in coffee or breakfast.', createdAt },
    { id: 'demo-spinach', name: 'Baby spinach', category: 'Produce', quantity: 1, unit: 'bag', expiryDate: isoFromToday(2, offset), location: 'Fridge', notes: 'Great for a quick green omelette.', createdAt },
    { id: 'demo-yogurt', name: 'Greek yogurt', category: 'Dairy', quantity: 4, unit: 'cups', expiryDate: isoFromToday(4, offset), location: 'Fridge', notes: 'Add fruit and granola for breakfast.', createdAt },
    { id: 'demo-chicken', name: 'Chicken breast', category: 'Meat', quantity: 2, unit: 'pieces', expiryDate: isoFromToday(6, offset), location: 'Fridge', notes: 'Marinate before roasting.', createdAt },
    { id: 'demo-bread', name: 'Sourdough loaf', category: 'Bakery', quantity: 1, unit: 'loaf', expiryDate: isoFromToday(9, offset), location: 'Pantry', notes: 'Slice and freeze what you will not use.', createdAt },
    { id: 'demo-eggs', name: 'Free-range eggs', category: 'Dairy', quantity: 6, unit: 'eggs', expiryDate: isoFromToday(12, offset), location: 'Fridge', notes: 'A reliable weeknight shortcut.', createdAt },
    { id: 'demo-cheese', name: 'Cheddar cheese', category: 'Dairy', quantity: 1, unit: 'block', expiryDate: isoFromToday(-1, offset), location: 'Fridge', notes: 'Still fine for toasties if used today.', createdAt },
    { id: 'demo-tomatoes', name: 'Cherry tomatoes', category: 'Produce', quantity: 250, unit: 'g', expiryDate: isoFromToday(3, offset), location: 'Fridge', notes: 'Roast with the chicken or toss into pasta.', createdAt },
    { id: 'demo-rice', name: 'Basmati rice', category: 'Pantry', quantity: 1, unit: 'bag', expiryDate: isoFromToday(45, offset), location: 'Pantry', notes: 'Long-life pantry staple.', createdAt },
  ]
}
