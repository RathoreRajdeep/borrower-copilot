import type { BorrowerInput } from '../types'
import type { Product } from './products'
import { apr } from './emi'
import { rateAdjustmentPP, scoreBand, type ScoreBand } from './credit'

export interface FairRateResult {
  bandLow: number
  bandHigh: number
  fairRate: number // the borrower's expected rate (band midpoint after adjustment)
  aprPct: number // all-in cost incl. fee+GST
  feePct: number // processing fee used
  reasons: string[]
  confidence: 'wide' | 'medium' | 'tight'
  product: Product
}

// GST on processing fee is 18% in India — part of the all-in cost.
const GST_ON_FEE = 0.18

export function computeFairRate(
  input: BorrowerInput,
  product: Product,
  amount: number,
  tenureYears: number,
  rawAnswered?: number,
): FairRateResult {
  const { delta, reasons } = rateAdjustmentPP(input)

  let low = product.rateLow + delta
  let high = product.rateHigh + delta

  // Collateral pulls the band down regardless of score.
  if (product.secured) {
    reasons.push(`${product.name} is secured by collateral, so the floor is lower`)
  } else {
    reasons.push(`${product.name} is unsecured — no collateral, so the band runs higher`)
  }

  // A loan that earns money (productive) improves the borrower's position,
  // but lenders price on risk, not use — so we don't widen the band, we note it.
  if ((input.monthlyIncomeFromLoan ?? 0) > 0) {
    reasons.push(
      `this loan should add ~₹${Math.round(input.monthlyIncomeFromLoan!)}/mo — improves your repayment, not the lender's quote`,
    )
  }

  const fairRate = low + (high - low) * profileWeight(scoreBand(input))

  const feePct = product.feePct * (1 + GST_ON_FEE)
  const months = Math.round(tenureYears * 12)
  const aprPct = apr(amount, fairRate, months, feePct)

  // Confidence widens with silence: fewer raw answers -> wider band shown.
  // Use the raw answered count (before defaults) so skipped questions
  // actually widen the band, per brief rule 2.
  const answered = rawAnswered ?? countAnswers(input)
  const confidence: FairRateResult['confidence'] =
    answered >= 14 ? 'tight' : answered >= 10 ? 'medium' : 'wide'
  // On wide confidence, widen the band deliberately.
  if (confidence === 'wide') {
    low -= 0.75
    high += 1.5
  } else if (confidence === 'medium') {
    low -= 0.25
    high += 0.5
  }

  return {
    bandLow: round2(low),
    bandHigh: round2(high),
    fairRate: round2(fairRate),
    aprPct: round2(aprPct),
    feePct: round2(product.feePct),
    reasons,
    confidence,
    product,
  }
}

// Count how many questions the borrower actually answered, to drive confidence.
export function countAnswers(input: BorrowerInput): number {
  let n = 0
  for (const v of Object.values(input)) {
    if (v !== undefined && v !== '' && !(typeof v === 'number' && Number.isNaN(v))) n++
  }
  return n
}

const round2 = (x: number) => Math.round(x * 100) / 100

// Where in the band the borrower's *expected* rate sits. A top-tier profile
// should expect the low end; a weak profile should expect the high end.
// This is a judgement call, documented in RULES.md.
function profileWeight(band: ScoreBand): number {
  switch (band) {
    case 'excellent':
      return 0.3
    case 'good':
      return 0.4
    case 'fair':
      return 0.5
    case 'average':
      return 0.6
    case 'unknown':
      return 0.5
    case 'none':
      return 0.6
    case 'weak':
      return 0.75
    case 'poor':
      return 0.85
  }
}

// A short, lender-comparable label for the score band.
export function scoreBandLabel(input: BorrowerInput): string {
  const b = scoreBand(input)
  if (b === 'unknown') return 'score unknown'
  if (b === 'none') return 'no credit history'
  const s = (input.creditScore as number) ?? 0
  return `score ${s}`
}
