function toIsoDate(day: string, month: string, year: string) {
  const fullYear = year.length === 2 ? `20${year}` : year
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function parseLabelText(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const dateRegex = /(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/g
  const dates = Array.from(clean.matchAll(dateRegex)).map((match) => ({ value: toIsoDate(match[1], match[2], match[3]), index: match.index ?? 0 }))
  const expiryMatch = clean.match(/(?:use\s*by|expiry|expires|exp|best\s*before|bbf)\s*[:\-]?\s*(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/i)
  const manufacturingMatch = clean.match(/(?:mfg|manufactur(?:ed|ing)|mfd)\s*[:\-]?\s*(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/i)
  const expiryDate = expiryMatch ? toIsoDate(expiryMatch[1], expiryMatch[2], expiryMatch[3]) : ''
  const manufacturingDate = manufacturingMatch ? toIsoDate(manufacturingMatch[1], manufacturingMatch[2], manufacturingMatch[3]) : ''
  const productName = clean.split(/(?:use\s*by|expiry|expires|exp|best\s*before|bbf|mfg|manufactur)/i)[0].replace(/[^a-zA-Z0-9 &'\-]/g, ' ').trim().slice(0, 80)
  return { productName, expiryDate, manufacturingDate, rawText: clean, confidence: expiryDate ? 'likely' : dates.length ? 'review' : 'low' as 'likely' | 'review' | 'low' }
}

export async function readExpiryPhotoLocal(imageDataUrl: string) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  try { const result = await worker.recognize(imageDataUrl); return parseLabelText(result.data.text) } finally { await worker.terminate() }
}
