import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Download, Leaf, RefreshCcw, Wifi, X } from 'lucide-react'
import { BrandMark, MobileFab, Navigation } from './components/Navigation'
import { HomeView, InsightsView, InventoryView, RecipesView, SettingsView } from './components/ScreenSections'
import { daysUntil, itemStatus } from './lib/expiry'
import { loadOpenRouterKey, saveOpenRouterKey } from './lib/openrouter'
import { createDemoItems } from './data'
import { exportState, importState, loadState, makeId, saveState } from './lib/storage'
import type { AppState, FoodItem, Page, Recipe, ThemePreference } from './types'

const AddItemSheet = lazy(() => import('./components/AddItemSheet'))
const ChartsPanel = lazy(() => import('./components/ChartsPanel'))

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [page, setPage] = useState<Page>('home')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error'; action?: { label: string; run: () => void } } | null>(null)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [updateReady, setUpdateReady] = useState<(() => Promise<void>) | null>(null)
  const [offlineReady, setOfflineReady] = useState(false)
  const [openRouterKey, setOpenRouterKey] = useState(() => loadOpenRouterKey())

  const actualTheme = useMemo(() => state.theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : state.theme, [state.theme])

  useEffect(() => { if (!saveState(state)) setToast({ message: 'This inventory is too large for browser storage. Export a backup and remove a large photo.', tone: 'error' }) }, [state])
  useEffect(() => { document.documentElement.classList.toggle('dark', actualTheme === 'dark'); document.documentElement.style.colorScheme = actualTheme }, [actualTheme])
  useEffect(() => {
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent) }
    const handleUpdate = (event: Event) => setUpdateReady(() => (event as CustomEvent<() => Promise<void>>).detail)
    const handleOffline = () => setOfflineReady(true)
    window.addEventListener('beforeinstallprompt', handleInstall)
    window.addEventListener('expiryguard:update-ready', handleUpdate)
    window.addEventListener('expiryguard:offline-ready', handleOffline)
    return () => { window.removeEventListener('beforeinstallprompt', handleInstall); window.removeEventListener('expiryguard:update-ready', handleUpdate); window.removeEventListener('expiryguard:offline-ready', handleOffline) }
  }, [])
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(null), 5000); return () => window.clearTimeout(timeout) }, [toast])
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const checkExpiryNotifications = async () => {
      const due = state.items.filter((item) => { const days = daysUntil(item.expiryDate, state.demoOffset); return days === state.notificationLead || days === 0 })
      for (const item of due) {
        const key = `expiryguard-notified:${item.id}:${item.expiryDate}:${state.demoOffset}:${state.notificationLead}`
        if (localStorage.getItem(key)) continue
        try { const registration = await navigator.serviceWorker?.ready; if (registration?.showNotification) await registration.showNotification(`${item.name} is due soon`, { body: `${item.name} · ${daysUntil(item.expiryDate, state.demoOffset) === 0 ? 'Use it today' : `${state.notificationLead} days left`}`, icon: assetPath('/icons/icon-192.png'), tag: key }); localStorage.setItem(key, '1') } catch { /* browser notification delivery is best-effort */ }
      }
    }
    checkExpiryNotifications()
    const interval = window.setInterval(checkExpiryNotifications, 60000)
    return () => window.clearInterval(interval)
  }, [state.items, state.demoOffset, state.notificationLead])

  function message(message: string, tone: 'success' | 'error' = 'success', action?: { label: string; run: () => void }) { setToast({ message, tone, action }) }
  function openAdd(item: FoodItem | null = null) { setEditingItem(item); setSheetOpen(true) }

  function saveItem(fields: Omit<FoodItem, 'id' | 'createdAt'>, existingId?: string) {
    setState((current) => { const nextItem = { ...fields, id: existingId ?? makeId(), createdAt: existingId ? current.items.find((item) => item.id === existingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString() }; return { ...current, items: existingId ? current.items.map((item) => item.id === existingId ? nextItem : item) : [...current.items, nextItem] } })
    message(existingId ? 'Food details updated.' : 'Added to your kitchen.', 'success')
  }

  function removeItem(item: FoodItem, markAsWasted = false) {
    const index = state.items.findIndex((entry) => entry.id === item.id)
    setState((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id), wastedCount: markAsWasted ? current.wastedCount + 1 : current.wastedCount }))
    message(`${item.name} removed.`, 'success', { label: 'Undo', run: () => { setState((current) => ({ ...current, items: [...current.items.slice(0, index), item, ...current.items.slice(index)], wastedCount: markAsWasted ? Math.max(0, current.wastedCount - 1) : current.wastedCount })); message(`${item.name} restored.`) } })
  }

  function useItem(item: FoodItem) {
    const index = state.items.findIndex((entry) => entry.id === item.id)
    setState((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id), usedCount: current.usedCount + 1 }))
    message(`${item.name} marked as used.`, 'success', { label: 'Undo', run: () => { setState((current) => ({ ...current, items: [...current.items.slice(0, index), item, ...current.items.slice(index)], usedCount: Math.max(0, current.usedCount - 1) })); message(`${item.name} restored.`) } })
  }

  function exportData() { const blob = new Blob([exportState(state)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `expiryguard-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); message('Your inventory JSON is ready.') }
  function importData(file: File) { const reader = new FileReader(); reader.onload = () => { try { setState(importState(String(reader.result))); message('Inventory imported successfully.') } catch (error) { message(error instanceof Error ? error.message : 'That file could not be imported.', 'error') } }; reader.readAsText(file) }
  function clearData() { if (!window.confirm('Clear all inventory? This cannot be undone unless you export first.')) return; setState((current) => ({ ...current, items: [], usedCount: 0, wastedCount: 0 })); message('Inventory cleared.') }
  function resetDemo() { setState((current) => ({ ...current, items: createDemoItems(), usedCount: 3, wastedCount: 1, demoOffset: 0, recipes: [] })); message('Demo kitchen reset.') }
  function simulate(days: number) { setState((current) => ({ ...current, demoOffset: current.demoOffset + days })); message(`Demo date moved forward ${days} day${days > 1 ? 's' : ''}.`) }
  async function notify() { if (!('Notification' in window)) { message('This browser does not support notifications.', 'error'); return }; if (Notification.permission === 'denied') { message('Notifications are blocked in browser settings.', 'error'); return }; const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission(); if (permission !== 'granted') { message('Notifications were not enabled.', 'error'); return }; try { const registration = await navigator.serviceWorker?.ready; if (registration?.showNotification) await registration.showNotification('ExpiryGuard reminder', { body: 'Your kitchen has a food item worth using soon.', icon: assetPath('/icons/icon.svg') }); else new Notification('ExpiryGuard reminder', { body: 'Your kitchen has a food item worth using soon.' }); message('Test reminder sent.') } catch { message('The test reminder could not be sent.', 'error') } }
  async function install() { if (!installPrompt) return; await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === 'accepted') message('ExpiryGuard is ready on your home screen.'); setInstallPrompt(null) }
  function saveRecipes(recipes: Recipe[]) { setState((current) => ({ ...current, recipes })); message('Fresh ideas are ready.') }
  function updateOpenRouterKey(value: string) { setOpenRouterKey(value); saveOpenRouterKey(value) }

  const screen = page === 'home' ? <HomeView state={state} onAdd={() => openAdd()} onOpen={openAdd} onUse={useItem} onDelete={(item) => removeItem(item, itemStatus(item, state.demoOffset) === 'expired')} onNavigate={setPage} onNotify={notify} /> : page === 'inventory' ? <InventoryView state={state} onAdd={() => openAdd()} onOpen={openAdd} onUse={useItem} onDelete={(item) => removeItem(item, itemStatus(item, state.demoOffset) === 'expired')} /> : page === 'recipes' ? <RecipesView state={state} onSave={saveRecipes} openRouterKey={openRouterKey} /> : page === 'insights' ? <Suspense fallback={<LoadingBlock />}><InsightsView state={state} charts={ChartsPanel} /></Suspense> : <SettingsView state={state} setTheme={(theme) => setState((current) => ({ ...current, theme }))} setLead={(notificationLead) => setState((current) => ({ ...current, notificationLead }))} openRouterKey={openRouterKey} setOpenRouterKey={updateOpenRouterKey} onExport={exportData} onImport={importData} onClear={clearData} onSimulate={simulate} onReset={resetDemo} onNotify={notify} />

  return <div className="app-surface min-h-screen"><Navigation page={page} onNavigate={setPage} onAdd={() => openAdd()} /><MobileFab onAdd={() => openAdd()} /><main className="min-h-screen pb-28 md:pl-[76px] lg:pl-[220px] lg:pb-0"><div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9"><header className="mb-8 flex items-center justify-between gap-4 lg:hidden"><BrandMark /><div className="flex items-center gap-1">{installPrompt && <button className="ghost-button text-xs" onClick={install}><Download size={16} /> Install</button>}<button className="ghost-button" aria-label="Enable notifications" onClick={notify}><Bell size={18} /></button></div></header><div className="mb-5 hidden items-center justify-end gap-2 lg:flex">{offlineReady && <span className="flex items-center gap-1.5 text-xs font-semibold text-guard-700 dark:text-guard-200"><Wifi size={14} /> Works offline</span>}{installPrompt && <button className="secondary-button text-xs" onClick={install}><Download size={15} /> Install app</button>}<button className="ghost-button" onClick={notify}><Bell size={17} /> Notifications</button></div><AnimatePresence mode="wait"><motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }}>{screen}</motion.div></AnimatePresence></div></main><Suspense fallback={null}><AddItemSheet open={sheetOpen} initialItem={editingItem} onClose={() => { setSheetOpen(false); setEditingItem(null) }} onSave={saveItem} onMessage={message} /></Suspense>{(toast || updateReady) && <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-[#17341c] px-4 py-3.5 text-sm font-semibold text-white shadow-2xl md:bottom-6">{updateReady ? <RefreshCcw size={18} className="shrink-0 text-guard-200" /> : <Leaf size={18} className="shrink-0 text-guard-200" />}<p className="flex-1">{updateReady ? 'A fresh ExpiryGuard update is ready.' : toast?.message}</p>{updateReady ? <button className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold" onClick={async () => { await updateReady(); setUpdateReady(null) }}>Refresh</button> : toast?.action && <button className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold" onClick={toast.action.run}>{toast.action.label}</button>}<button className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10" aria-label="Dismiss" onClick={() => { setToast(null); setUpdateReady(null) }}><X size={16} /></button></div>}</div>
}

function LoadingBlock() { return <div className="surface-card min-h-80 animate-pulse rounded-[28px]" /> }
