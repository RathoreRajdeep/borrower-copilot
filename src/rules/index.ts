import type { BorrowerInput } from '../types'
import { pickProduct } from './products'
import { computeFairRate } from './fairRate'
import { computeMaxAmount } from './maxAmount'
import { computeEmiCeiling } from './emiCeiling'
import { computeBorrowVerdict } from './borrowVerdict'
import { effectiveIncome } from './affordability'
import { applyDefaults, answeredCount } from '../questions/schema'
import type { FairRateResult } from './fairRate'
import type { MaxAmountResult } from './maxAmount'
import type { EmiCeilingResult } from './emiCeiling'
import type { BorrowVerdictResult } from './borrowVerdict'

export interface Assessment {
  product: ReturnType<typeof pickProduct>
  tenureYears: number
  rate: FairRateResult
  amount: MaxAmountResult
  emi: EmiCeilingResult
  verdict: BorrowVerdictResult
  card: NegotiationCard
  confidence: 'wide' | 'medium' | 'tight'
}

export interface NegotiationCard {
  product: string
  secured: boolean
  safeAmount: number
  lenderSanction: number
  rateBand: string
  fairRate: number
  aprPct: number
  emiCeiling: number
  tenure: number
  scoreLine: string
  verdictLine: string
  because: string[]
}

export function assess(rawInput: BorrowerInput): Assessment {
  // Apply defaults internally so confidence can be computed from the raw
  // input (before defaults fill in 0s that would count as "answered").
  const input = applyDefaults(rawInput)
  const rawAnswered = answeredCount(rawInput)

  const product = pickProduct(input.purpose, input.collateralKind)

  // Tenure: borrower preference within product band, else a sensible default.
  const tenureYears = clampTenure(input.tenureYears ?? defaultTenure(product), product)

  // Rate is computed on the wanted amount so the APR is honest for the loan
  // they're shopping for. Confidence uses the raw answered count.
  const rate = computeFairRate(input, product, input.amountWanted, tenureYears, rawAnswered)
  const amount = computeMaxAmount(input, product, rate.fairRate, tenureYears)

  // Stress the ACTUAL amount they'll borrow, not the wanted amount.
  const actualBorrow = Math.min(input.amountWanted, amount.recommend)
  const emi = computeEmiCeiling(input, product, rate.fairRate, actualBorrow)
  const verdict = computeBorrowVerdict(input, product, amount.borrowerSafe, emi.stress.survives)

  const card: NegotiationCard = buildCard(input, product, rate, amount, emi, verdict, tenureYears)

  return {
    product,
    tenureYears,
    rate,
    amount,
    emi,
    verdict,
    card,
    confidence: rate.confidence,
  }
}

function buildCard(
  input: BorrowerInput,
  product: ReturnType<typeof pickProduct>,
  rate: FairRateResult,
  amount: MaxAmountResult,
  emi: EmiCeilingResult,
  verdict: BorrowVerdictResult,
  tenureYears: number,
): NegotiationCard {
  const s = input.creditScore
  const scoreLine =
    s === 'unknown'
      ? 'Credit score: unknown — to be confirmed with CIBIL'
      : s === 'none'
        ? 'Credit history: none (first-time borrower)'
        : `Credit score: ${s}`

  const verdictLine =
    verdict.verdict === 'borrow'
      ? 'Borrow, but hold the lender to this card.'
      : verdict.verdict === 'borrow-less'
        ? `Borrow only ₹${Math.round(amount.borrowerSafe).toLocaleString('en-IN')} — not the full ask.`
        : `Don't borrow on these terms. ${verdict.suggestions[0] ?? ''}`.trim()

  const because = [
    `Income (effective): ₹${Math.round(
      effectiveIncome(input),
    ).toLocaleString('en-IN')}/mo (${input.incomeType})`,
    `Existing EMIs: ₹${Math.round(input.existingEMIs).toLocaleString('en-IN')}/mo`,
    `Safe monthly EMI ceiling: ₹${Math.round(emi.ceiling).toLocaleString('en-IN')}`,
    `${product.secured ? 'Secured' : 'Unsecured'} · fair band ${rate.bandLow}–${rate.bandHigh}%`,
    `All-in APR (incl. fee + GST): ${rate.aprPct}%`,
    ...(verdict.reasons.length ? [verdict.reasons[0]] : []),
  ]

  return {
    product: product.name,
    secured: product.secured,
    safeAmount: Math.round(amount.borrowerSafe),
    lenderSanction: Math.round(amount.lenderSanction),
    rateBand: `${rate.bandLow}–${rate.bandHigh}%`,
    fairRate: rate.fairRate,
    aprPct: rate.aprPct,
    emiCeiling: Math.round(emi.ceiling),
    tenure: tenureYears,
    scoreLine,
    verdictLine,
    because,
  }
}

function defaultTenure(product: ReturnType<typeof pickProduct>): number {
  // Weddings/personal: short. Secured business/property: longer.
  if (product.key === 'personal' || product.key === 'wedding') return 4
  if (product.key === 'lap' || product.key === 'business') return 10
  if (product.key === 'twowheeler' || product.key === 'gold') return 3
  if (product.key === 'vehicle') return 5
  return Math.min(5, Math.ceil((product.tenureMin + product.tenureMax) / 2))
}

function clampTenure(years: number, product: ReturnType<typeof pickProduct>): number {
  return Math.max(product.tenureMin, Math.min(product.tenureMax, years))
}
