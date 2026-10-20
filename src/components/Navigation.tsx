import { BarChart3, ChefHat, ClipboardList, Home, Leaf, Settings, Plus } from 'lucide-react'
import type { Page } from '../types'

const links: Array<{ id: Page; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Today', icon: Home },
  { id: 'inventory', label: 'Inventory', icon: ClipboardList },
  { id: 'recipes', label: 'Recipes', icon: ChefHat },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BrandMark() {
  return <div className="flex items-center gap-2.5"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-guard-700 text-white shadow-lg shadow-guard-700/20"><Leaf size={21} strokeWidth={2.5} /></div><div><div className="text-[15px] font-extrabold tracking-tight">ExpiryGuard</div><div className="text-[11px] font-medium muted-copy">Use food well</div></div></div>
}

function NavItem({ link, active, onClick }: { link: typeof links[number]; active: boolean; onClick: () => void }) {
  const Icon = link.icon
  return <button aria-current={active ? 'page' : undefined} aria-label={link.label} onClick={onClick} className={`touch-target pressable flex items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors ${active ? 'bg-guard-100 text-guard-700 dark:bg-guard-500/15 dark:text-guard-200' : 'muted-copy hover:bg-[var(--surface-muted)]'}`}><Icon size={19} strokeWidth={active ? 2.5 : 2} /><span>{link.label}</span></button>
}

export function Navigation({ page, onNavigate, onAdd }: { page: Page; onNavigate: (page: Page) => void; onAdd: () => void }) {
  return <>
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] flex-col border-r border-[var(--line)] bg-[var(--surface)] px-4 py-7 lg:flex">
      <div className="px-2"><BrandMark /></div>
      <nav className="mt-12 flex flex-col gap-2">{links.map((link) => <NavItem key={link.id} link={link} active={page === link.id} onClick={() => onNavigate(link.id)} />)}</nav>
      <div className="mt-auto rounded-3xl bg-guard-50 p-4 dark:bg-guard-500/10"><Leaf size={18} className="text-guard-700 dark:text-guard-200" /><p className="mt-3 text-xs font-semibold leading-5 text-guard-700 dark:text-guard-200">Small choices add up. Keep your kitchen in the loop.</p></div>
    </aside>
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col items-center border-r border-[var(--line)] bg-[var(--surface)] py-7 md:flex lg:hidden">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-guard-700 text-white"><Leaf size={21} /></div>
      <nav className="mt-14 flex flex-col gap-3">{links.map((link) => { const Icon = link.icon; return <button key={link.id} aria-label={link.label} aria-current={page === link.id ? 'page' : undefined} onClick={() => onNavigate(link.id)} className={`touch-target pressable grid h-12 w-12 place-items-center rounded-2xl ${page === link.id ? 'bg-guard-100 text-guard-700 dark:bg-guard-500/15 dark:text-guard-200' : 'muted-copy hover:bg-[var(--surface-muted)]'}`}><Icon size={20} /></button> })}</nav>
      <button onClick={onAdd} aria-label="Add food" className="mt-auto grid h-12 w-12 place-items-center rounded-2xl bg-guard-700 text-white shadow-lg shadow-guard-700/20"><Plus size={22} /></button>
    </aside>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[76px] items-center justify-around border-t border-[var(--line)] bg-[var(--surface)] px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
      {links.map((link) => { const Icon = link.icon; return <button key={link.id} aria-label={link.label} aria-current={page === link.id ? 'page' : undefined} onClick={() => onNavigate(link.id)} className={`touch-target flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold ${page === link.id ? 'text-guard-700 dark:text-guard-200' : 'muted-copy'}`}><span className={`grid h-8 w-12 place-items-center rounded-2xl ${page === link.id ? 'bg-guard-100 dark:bg-guard-500/15' : ''}`}><Icon size={18} /></span>{link.label}</button> })}
    </nav>
  </>
}

export function MobileFab({ onAdd }: { onAdd: () => void }) { return <button onClick={onAdd} aria-label="Add food" className="fixed bottom-[88px] right-5 z-30 flex min-h-[54px] items-center gap-2 rounded-2xl bg-guard-700 px-4 font-bold text-white shadow-xl shadow-guard-700/25 md:hidden"><Plus size={20} /> Add food</button> }
