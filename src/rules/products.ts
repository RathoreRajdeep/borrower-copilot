import type { LoanPurpose } from '../types'

// Loan product catalogue. Bands are Indian market mid-2026 ranges,
// from public rate sheets of large banks / NBFCs and RBI asset-class caps.
// Every entry is defended in RULES.md.
export interface Product {
  key: LoanPurpose | 'lap' | 'twowheeler'
  name: string
  secured: boolean
  // Fair rate band for a *neutral* borrower, % p.a.
  rateLow: number
  rateHigh: number
  // Typical tenure band, years
  tenureMin: number
  tenureMax: number
  // Processing fee as % of principal (excl. GST; we add 18% GST in APR).
  feePct: number
  // Max loan-to-value when collateral is involved.
  ltvMax: number
}

export const PRODUCTS: Record<string, Product> = {
  home: {
    key: 'home',
    name: 'Home loan',
    secured: true,
    rateLow: 8.4,
    rateHigh: 9.6,
    tenureMin: 10,
    tenureMax: 30,
    feePct: 0.5,
    ltvMax: 0.8,
  },
  lap: {
    // Loan Against Property — Ravi's likely route.
    key: 'lap',
    name: 'Loan Against Property',
    secured: true,
    rateLow: 9.5,
    rateHigh: 11.5,
    tenureMin: 5,
    tenureMax: 15,
    feePct: 1.0,
    ltvMax: 0.65,
  },
  personal: {
    key: 'personal',
    name: 'Personal loan',
    secured: false,
    rateLow: 11.0,
    rateHigh: 18.0,
    tenureMin: 1,
    tenureMax: 6,
    feePct: 2.5,
    ltvMax: 0,
  },
  wedding: {
    // Treated as personal, consumption — flagged in the verdict.
    key: 'wedding',
    name: 'Personal loan (wedding)',
    secured: false,
    rateLow: 11.0,
    rateHigh: 18.0,
    tenureMin: 1,
    tenureMax: 5,
    feePct: 2.5,
    ltvMax: 0,
  },
  business: {
    key: 'business',
    name: 'Business loan (secured)',
    secured: true,
    rateLow: 10.5,
    rateHigh: 14.0,
    tenureMin: 3,
    tenureMax: 7,
    feePct: 1.5,
    ltvMax: 0.65,
  },
  gold: {
    key: 'gold',
    name: 'Gold loan',
    secured: true,
    rateLow: 9.0,
    rateHigh: 13.0,
    tenureMin: 0.5,
    tenureMax: 4,
    feePct: 1.0,
    ltvMax: 0.75,
  },
  twowheeler: {
    // Two-wheeler / electric scooter — Anita's secured route.
    key: 'twowheeler',
    name: 'Two-wheeler loan',
    secured: true,
    rateLow: 9.5,
    rateHigh: 14.0,
    tenureMin: 1,
    tenureMax: 4,
    feePct: 2.0,
    ltvMax: 0.9,
  },
  vehicle: {
    key: 'vehicle',
    name: 'Car loan',
    secured: true,
    rateLow: 9.0,
    rateHigh: 12.0,
    tenureMin: 3,
    tenureMax: 7,
    feePct: 1.5,
    ltvMax: 0.85,
  },
}

// Map a stated purpose to the best-fit product, possibly upgrading to a
// secured product when the borrower has collateral (the Ravi case).
export function pickProduct(
  purpose: LoanPurpose,
  collateralKind?: string,
): Product {
  if (purpose === 'home') return PRODUCTS.home
  if (purpose === 'gold' || collateralKind === 'gold') return PRODUCTS.gold
  if (purpose === 'property') return PRODUCTS.lap
  if (purpose === 'business') {
    return collateralKind === 'property' ? PRODUCTS.lap : PRODUCTS.business
  }
  if (purpose === 'vehicle') return PRODUCTS.vehicle
  if (purpose === 'personal' || purpose === 'wedding' || purpose === 'other') {
    // A personal purpose with property to pledge routes to LAP — cheaper.
    return collateralKind === 'property' ? PRODUCTS.lap : PRODUCTS.personal
  }
  return PRODUCTS.personal
}
