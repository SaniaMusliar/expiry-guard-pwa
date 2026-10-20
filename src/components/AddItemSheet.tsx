import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Barcode, Camera, Check, ImagePlus, Loader2, ScanLine, Sparkles, Upload, X } from 'lucide-react'
import { lookupBarcode, scanVideo } from '../lib/barcode'
import { readExpiryPhotoLocal } from '../lib/ai'
import { isoFromToday } from '../data'
import type { Category, FoodItem, Location } from '../types'

const categories: Category[] = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Other']
const locations: Location[] = ['Fridge', 'Freezer', 'Pantry']
type Tab = 'manual' | 'scan' | 'photo'

export default function AddItemSheet({ open, initialItem, onClose, onSave, onMessage }: { open: boolean; initialItem?: FoodItem | null; onClose: () => void; onSave: (item: Omit<FoodItem, 'id' | 'createdAt'>, existingId?: string) => void; onMessage: (message: string, tone?: 'success' | 'error') => void }) {
  const [tab, setTab] = useState<Tab>('manual')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Produce')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('item')
  const [expiryDate, setExpiryDate] = useState(isoFromToday(3))
  const [location, setLocation] = useState<Location>('Fridge')
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [scanError, setScanError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopScanRef = useRef<(() => void) | undefined>()
  const dialogRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    setTab('manual'); setScanError(''); setPhotoError(''); setBusy(false)
    if (initialItem) { setName(initialItem.name); setCategory(initialItem.category); setQuantity(initialItem.quantity); setUnit(initialItem.unit); setExpiryDate(initialItem.expiryDate); setLocation(initialItem.location); setNotes(initialItem.notes); setBarcode(initialItem.barcode ?? ''); setImageUrl(initialItem.imageUrl) }
    else { setName(''); setCategory('Produce'); setQuantity(1); setUnit('item'); setExpiryDate(isoFromToday(3)); setLocation('Fridge'); setNotes(''); setBarcode(''); setImageUrl(undefined) }
  }, [open, initialItem])

  useEffect(() => () => { stopScanRef.current?.() }, [])
  useEffect(() => { if (tab !== 'scan') stopScanRef.current?.() }, [tab])
  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'))
      if (!focusable.length) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener('keydown', handleKeyDown); previousFocusRef.current?.focus() }
  }, [open, onClose])

  async function startScan() {
    setScanError(''); setBusy(true)
    try { if (!videoRef.current) return; stopScanRef.current = await scanVideo(videoRef.current, async (value) => { setBarcode(value); stopScanRef.current?.(); setBusy(true); try { const product = await lookupBarcode(value); if (!product) setScanError('We could not find that product. Add it manually below.'); else { setName(product.name); setCategory(product.category); setImageUrl(product.imageUrl); setTab('manual'); onMessage('Product found — check the details before saving.', 'success') } } catch (error) { setScanError(error instanceof Error ? error.message : 'Lookup failed.'); } finally { setBusy(false) } }) } catch (error) { setScanError(error instanceof Error ? error.message : 'Camera permission was denied. You can enter the barcode manually.'); setBusy(false) }
  }

  async function manualLookup() {
    if (!barcode.trim()) return
    setBusy(true); setScanError('')
    try { const product = await lookupBarcode(barcode.trim()); if (!product) setScanError('Product not found. Try manual entry.'); else { setName(product.name); setCategory(product.category); setImageUrl(product.imageUrl); onMessage('Product found — check the details before saving.', 'success') } } catch (error) { setScanError(error instanceof Error ? error.message : 'Lookup failed.') } finally { setBusy(false) }
  }

  async function compressImage(dataUrl: string) {
    return new Promise<string>((resolve, reject) => {
      const image = new Image()
      image.onload = () => { const max = 1200; const scale = Math.min(1, max / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); const context = canvas.getContext('2d'); if (!context) { reject(new Error('Image processing is unavailable.')); return }; context.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .72)) }
      image.onerror = () => reject(new Error('That image could not be opened.'))
      image.src = dataUrl
    })
  }

  async function handlePhoto(file?: File) {
    if (!file) return
    setBusy(true); setPhotoError('')
    const reader = new FileReader()
    reader.onload = async () => { try { const result = await compressImage(String(reader.result)); setImageUrl(result); const local = await readExpiryPhotoLocal(result); if (local.productName) setName(local.productName); if (local.expiryDate) { setExpiryDate(local.expiryDate); setTab('manual'); onMessage('Expiry label read on this device — review and save when ready.', 'success') } else { setTab('manual'); setPhotoError(local.manufacturingDate ? 'We found a manufacturing date, not a safe expiry date. Please enter the expiry date manually.' : 'We could not confidently read an expiry date. Please review and enter it manually.') } } catch (error) { setPhotoError(error instanceof Error ? error.message : 'Could not read that image. You can still enter the details manually.') } finally { setBusy(false) } }
    reader.onerror = () => { setPhotoError('That image could not be opened.'); setBusy(false) }
    reader.readAsDataURL(file)
  }

  function save() {
    if (!name.trim() || !expiryDate) { onMessage('Add a name and expiry date to save this food.', 'error'); return }
    onSave({ name: name.trim(), category, quantity: Math.max(1, quantity), unit: unit || 'item', expiryDate, location, notes: notes.trim(), barcode: barcode.trim() || undefined, imageUrl }, initialItem?.id)
    onClose()
  }

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [{ id: 'manual', label: 'Manual', icon: ClipboardIcon }, { id: 'scan', label: 'Barcode', icon: Barcode }, { id: 'photo', label: 'Snap photo', icon: Camera }]
  return <AnimatePresence>{open && <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><motion.section ref={dialogRef} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="add-food-title"><div className="drag-handle" /><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-guard-700 dark:text-guard-200">Kitchen log</p><h2 id="add-food-title" className="mt-1 text-2xl font-extrabold tracking-tight">{initialItem ? 'Edit food' : 'Add food'}</h2><p className="mt-1 text-sm muted-copy">Capture it now, use it when it matters.</p></div><button ref={closeButtonRef} onClick={onClose} aria-label="Close" className="ghost-button"><X size={20} /></button></div>
    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--surface-muted)] p-1" role="tablist" aria-label="Add food methods">{tabs.map(({ id, label, icon: Icon }) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)} className={`touch-target flex items-center justify-center gap-2 rounded-xl px-2 text-xs font-bold ${tab === id ? 'bg-[var(--surface)] text-guard-700 shadow-sm dark:text-guard-200' : 'muted-copy'}`}><Icon size={15} />{label}</button>)}</div>
    {tab === 'scan' && <div className="mt-5"><div className="relative overflow-hidden rounded-3xl bg-slate-950"><video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline /><div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70"><span className="absolute -top-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-white" /></div><div className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white/85">Center a barcode inside the frame</div></div><div className="mt-3 flex gap-2"><button className="primary-button flex-1" onClick={startScan} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={18} /> : <ScanLine size={18} />} {busy ? 'Scanning…' : 'Start camera'}</button><button className="secondary-button" onClick={manualLookup} disabled={busy || !barcode}>Look up</button></div><input className="field mt-3" value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Or enter a barcode" inputMode="numeric" aria-label="Barcode" />{scanError && <p className="mt-3 rounded-2xl bg-coral/10 p-3 text-xs font-semibold text-coral">{scanError}</p>}</div>}
    {tab === 'photo' && <div className="mt-5"><label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-7 text-center"><input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => handlePhoto(event.target.files?.[0])} /><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface)] text-guard-700 dark:text-guard-200"><ImagePlus size={24} /></div><p className="mt-3 text-sm font-extrabold">Snap the expiry label</p><p className="mt-1 max-w-xs text-xs muted-copy">ExpiryGuard reads the label locally on your device. Optional AI recognition is only used if you configure it.</p><span className="secondary-button mt-4"><Upload size={15} /> Choose image</span></label>{imageUrl && <img src={imageUrl} alt="Expiry label preview" className="mt-3 max-h-36 w-full rounded-2xl object-cover" />}{photoError && <p className="mt-3 rounded-2xl bg-coral/10 p-3 text-xs font-semibold text-coral">{photoError}</p>}</div>}
    {tab === 'manual' && <div className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-[1fr_140px]"><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Food name</span><input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Strawberries" autoFocus /></label><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Category</span><select className="field" value={category} onChange={(event) => setCategory(event.target.value as Category)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Quantity</span><div className="flex gap-2"><input className="field" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /><input className="field" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="unit" /></div></label><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Expiry date</span><input className="field" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></label></div><div><span className="mb-2 block text-xs font-bold muted-copy">Quick pick</span><div className="flex flex-wrap gap-2">{[['+3 days', 3], ['+1 week', 7], ['+1 month', 30]].map(([label, days]) => <button type="button" key={label} onClick={() => setExpiryDate(isoFromToday(Number(days)))} className="soft-pill min-h-10 px-3 text-xs font-bold text-guard-700 dark:text-guard-200">{label}</button>)}</div></div><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Storage</span><div className="grid grid-cols-3 gap-2">{locations.map((option) => <button type="button" key={option} onClick={() => setLocation(option)} className={`touch-target rounded-2xl border text-xs font-bold ${location === option ? 'border-guard-500 bg-guard-100 text-guard-700 dark:border-guard-400 dark:bg-guard-500/15 dark:text-guard-200' : 'border-[var(--line)] muted-copy'}`}>{option}</button>)}</div></label><label className="block"><span className="mb-1.5 block text-xs font-bold muted-copy">Notes <span className="font-normal">(optional)</span></span><textarea className="field min-h-20 resize-y" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="A serving idea, reminder, or storage note" /></label></div>}
    <div className="mt-6 flex gap-3 border-t border-[var(--line)] pt-4"><button className="ghost-button flex-1" onClick={onClose}>Cancel</button><button className="primary-button flex-[2]" onClick={save}><Check size={18} /> {initialItem ? 'Save changes' : 'Add to inventory'}</button></div>
  </motion.section></div>}</AnimatePresence>
}

function ClipboardIcon(props: { size?: number }) { return <Sparkles {...props} /> }
