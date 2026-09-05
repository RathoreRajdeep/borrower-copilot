// Indian number formatting helpers (lakh/crore grouping).

export function inr(n: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 0
  return Math.round(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function inrShort(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${inr(n)}`
}

export function rupee(n: number): string {
  return `₹${inr(n)}`
}

export function pct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}

// Group digits with Indian lakh/crore grouping (rightmost 3, then groups of 2).
// e.g. 800000 -> "8,00,000". Input is raw digits only (no decimals here).
export function groupIndian(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.length <= 3) return d
  // last 3 digits, then groups of 2 going left
  const last3 = d.slice(-3)
  const rest = d.slice(0, -3)
  const grouped = rest.replace(/(\d)(?=(\d{2})+(?!\d))/g, '$1,')
  return `${grouped},${last3}`
}

// Parse a grouped string back to a number.
export function parseGrouped(s: string): number {
  const n = Number(s.replace(/[,\s₹]/g, ''))
  return Number.isNaN(n) ? 0 : n
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return o ? `${TENS[t]}-${ONES[o]}` : TENS[t]
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  const parts: string[] = []
  if (h) parts.push(`${ONES[h]} hundred`)
  if (r) parts.push(h ? `and ${twoDigits(r)}` : twoDigits(r))
  return parts.join(' ')
}

// Convert a whole number to words using the Indian system
// (thousand, lakh, crore). The crore part recurses so arbitrarily large
// numbers never produce "Undefined" (e.g. 1000+ crore = 1 arab).
export function toWordsIndian(n: number): string {
  if (!Number.isFinite(n)) return ''
  if (n === 0) return 'zero'
  if (n < 0) return `minus ${toWordsIndian(-n)}`

  const crore = Math.floor(n / 1_00_00_000)
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000)
  const thousand = Math.floor((n % 1_00_000) / 1000)
  const rest = n % 1000

  const parts: string[] = []
  if (crore) parts.push(`${toWordsIndian(crore)} crore`)
  if (lakh) parts.push(`${twoDigits(lakh)} lakh`)
  if (thousand) parts.push(`${twoDigits(thousand)} thousand`)
  if (rest) parts.push(threeDigits(rest))

  // Capitalise first letter.
  const s = parts.join(' ').replace(/\s+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}
