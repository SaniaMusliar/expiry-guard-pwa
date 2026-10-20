import { BrowserMultiFormatReader } from '@zxing/browser'
import type { Category } from '../types'

export interface BarcodeProduct { name: string; category: Category; imageUrl?: string; barcode: string }

type BarcodeDetectorLike = new (options?: { formats?: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> }

export function hasNativeBarcodeDetector() {
  return 'BarcodeDetector' in window
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  if (!navigator.onLine) throw new Error('Barcode lookups need a connection. You can add the food manually while offline.')
  const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`)
  if (!response.ok) throw new Error('Open Food Facts is unavailable right now.')
  const data = await response.json()
  if (data.status !== 1 || !data.product) return null
  const product = data.product
  const categoryText = `${product.categories_tags?.join(' ') ?? ''} ${product.categories ?? ''}`.toLowerCase()
  const category: Category = categoryText.includes('milk') || categoryText.includes('yogurt') || categoryText.includes('cheese') ? 'Dairy' : categoryText.includes('bread') || categoryText.includes('bakery') ? 'Bakery' : categoryText.includes('meat') || categoryText.includes('chicken') ? 'Meat' : categoryText.includes('frozen') ? 'Frozen' : categoryText.includes('fruit') || categoryText.includes('vegetable') ? 'Produce' : 'Other'
  return { name: product.product_name || product.generic_name || 'Scanned food', category, imageUrl: product.image_front_url, barcode }
}

export async function scanVideo(video: HTMLVideoElement, onDetected: (barcode: string) => void) {
  if (hasNativeBarcodeDetector()) {
    const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorLike }).BarcodeDetector
    const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    video.srcObject = stream
    await video.play()
    let active = true
    const tick = async () => {
      if (!active) return
      try { const [result] = await detector.detect(video); if (result?.rawValue) onDetected(result.rawValue) } catch { /* keep scanning */ }
      window.setTimeout(tick, 350)
    }
    tick()
    return () => { active = false; stream.getTracks().forEach((track) => track.stop()) }
  }
  const reader = new BrowserMultiFormatReader()
  const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => { if (result?.getText()) onDetected(result.getText()) })
  return () => controls.stop()
}
