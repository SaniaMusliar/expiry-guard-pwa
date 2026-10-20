import type { FoodItem, ItemStatus } from '../types'

export function startOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function daysUntil(isoDate: string, offset = 0) {
  const target = startOfDay(new Date(`${isoDate}T12:00:00`))
  const today = startOfDay(new Date())
  today.setDate(today.getDate() + offset)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function itemStatus(item: FoodItem, offset = 0): ItemStatus {
  const days = daysUntil(item.expiryDate, offset)
  if (days < 0) return 'expired'
  if (days === 0) return 'today'
  if (days <= 2) return 'soon'
  if (days <= 7) return 'amber'
  return 'fresh'
}

export function statusLabel(status: ItemStatus) {
  return { expired: 'Expired', today: 'Today', soon: 'Soon', amber: 'This week', fresh: 'Fresh' }[status]
}

export function countdown(item: FoodItem, offset = 0) {
  const days = daysUntil(item.expiryDate, offset)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Use today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${isoDate}T12:00:00`))
}

export function statusColor(status: ItemStatus) {
  return {
    expired: { text: 'text-coral', bg: 'bg-coral/10', ring: '#E76654', dot: 'bg-coral' },
    today: { text: 'text-coral', bg: 'bg-coral/10', ring: '#E76654', dot: 'bg-coral' },
    soon: { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-500/15', ring: '#EF923D', dot: 'bg-orange-500' },
    amber: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/15', ring: '#D7A933', dot: 'bg-amber-500' },
    fresh: { text: 'text-guard-700 dark:text-guard-200', bg: 'bg-guard-100 dark:bg-guard-500/15', ring: '#4CAF50', dot: 'bg-guard-500' },
  }[status]
}

export function sortByExpiry(items: FoodItem[], offset = 0) {
  return [...items].sort((a, b) => daysUntil(a.expiryDate, offset) - daysUntil(b.expiryDate, offset))
}

export function getMetrics(items: FoodItem[], usedCount: number, offset = 0) {
  return {
    today: items.filter((item) => daysUntil(item.expiryDate, offset) === 0).length,
    nextThree: items.filter((item) => { const days = daysUntil(item.expiryDate, offset); return days >= 0 && days <= 3 }).length,
    total: items.length,
    saved: usedCount,
  }
}
