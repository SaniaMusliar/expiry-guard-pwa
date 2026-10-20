import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, MapPin, PackageCheck, Trash2 } from 'lucide-react'
import { countdown, daysUntil, formatDate, itemStatus, statusColor, statusLabel } from '../lib/expiry'
import type { FoodItem } from '../types'

export function ExpiryRing({ item, offset = 0, compact = false }: { item: FoodItem; offset?: number; compact?: boolean }) {
  const status = itemStatus(item, offset)
  const colors = statusColor(status)
  const days = daysUntil(item.expiryDate, offset)
  const progress = status === 'expired' || status === 'today' ? 100 : Math.max(10, Math.round(((14 - Math.min(14, Math.max(0, days))) / 14) * 100))
  const size = compact ? 50 : 60
  const stroke = compact ? 4 : 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return <div className="status-ring" style={{ width: size, height: size, background: `conic-gradient(${colors.ring} ${progress}%, var(--surface-muted) 0)` }} aria-label={`${statusLabel(status)} — ${countdown(item, offset)}`}><div className="grid h-[calc(100%-8px)] w-[calc(100%-8px)] place-items-center rounded-full bg-[var(--surface)]"><span className={`text-center ${compact ? 'text-[10px]' : 'text-[11px]'} font-extrabold leading-tight ${colors.text}`}>{status === 'expired' ? 'Past' : countdown(item, offset).replace(' days left', 'd').replace(' day left', 'd')}</span></div><svg className="pointer-events-none absolute" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true"><circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="transparent" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} /></svg></div>
}

export function FoodCard({ item, offset = 0, onOpen, onUse, onDelete, horizontal = false }: { item: FoodItem; offset?: number; onOpen: () => void; onUse?: () => void; onDelete?: () => void; horizontal?: boolean }) {
  const status = itemStatus(item, offset)
  const colors = statusColor(status)
  return <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24 }} className={`surface-card group relative rounded-[24px] p-4 ${horizontal ? 'min-w-[250px]' : ''}`}>
    <button onClick={onOpen} className="absolute inset-0 z-0 rounded-[24px]" aria-label={`Open ${item.name}`} />
    <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none"><div className="min-w-0"><div className="mb-2 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${colors.dot}`} /><span className={`text-[11px] font-bold uppercase tracking-[.12em] ${colors.text}`}>{statusLabel(status)}</span></div><h3 className="truncate text-[16px] font-extrabold tracking-tight">{item.name}</h3><p className="mt-1 truncate text-xs muted-copy">{item.quantity} {item.unit} · {item.location}</p></div><ExpiryRing item={item} offset={offset} compact /></div>
    <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 pointer-events-none"><span className="flex items-center gap-1.5 text-xs muted-copy"><CalendarDays size={14} /> {formatDate(item.expiryDate)}</span><span className={`text-xs font-bold ${colors.text}`}>{countdown(item, offset)}</span></div>
    {(onUse || onDelete) && <div className="relative z-10 mt-3 flex gap-2"><button className="secondary-button flex-1 text-xs" onClick={onUse}><PackageCheck size={15} /> Used</button><button className="ghost-button text-xs" onClick={onDelete} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div>}
  </motion.article>
}

export function ItemMeta({ item }: { item: FoodItem }) { return <div className="flex flex-wrap gap-2 text-xs muted-copy"><span className="soft-pill inline-flex items-center gap-1.5 px-2.5 py-1.5"><MapPin size={13} />{item.location}</span><span className="soft-pill inline-flex items-center gap-1.5 px-2.5 py-1.5">{item.category}</span></div> }
