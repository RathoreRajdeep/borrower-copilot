import type { BorrowerInput } from '../types'
import type { Product } from './products'
import { safeSurplus, effectiveIncome, householdIncome } from './affordability'
import { scoreBand } from './credit'

export type Verdict = 'borrow' | 'borrow-less' | 'dont-borrow'

export interface BorrowVerdictResult {
  verdict: Verdict
  headline: string
  reasons: string[] // the why, one bullet per driver
  suggestions: string[] // optional better path (secured, refinance, co-applicant)
  isProductive: boolean
}

export function computeBorrowVerdict(
  input: BorrowerInput,
  product: Product,
  safeAmount: number,
  stressSurvives: boolean,
): BorrowVerdictResult {
  const reasons: string[] = []
  const suggestions: string[] = []
  const surplus = safeSurplus(input)
  const inc = effectiveIncome(input)
  const band = scoreBand(input)
  const wanted = input.amountWanted
  const productive = (input.monthlyIncomeFromLoan ?? 0) > 0

  const existingFoir = input.existingEMIs / Math.max(1, householdIncome(input))

  // --- Hard stops: DON'T BORROW ---
  if (surplus <= 0) {
    reasons.push(
      `Your safe surplus is ₹${fmt(surplus)} after ₹${fmt(
        input.householdExpenses,
      )} expenses and ₹${fmt(input.existingEMIs)} existing EMIs. There is no room for a new EMI.`,
    )
    return block(input, product, reasons, suggestions, productive)
  }

  // Already over-leveraged before this loan.
  if (existingFoir > 0.5 && !product.secured) {
    reasons.push(
      `Existing EMIs are already ${Math.round(existingFoir * 100)}% of your income — above the safe line. Adding unsecured debt here compounds the risk.`,
    )
    return block(input, product, reasons, suggestions, productive)
  }

  // App-loan / high-cost trap with a bounce (the Anita signal).
  if ((input.bouncesLast6m ?? 0) >= 1 && !product.secured) {
    reasons.push(
      `An EMI has bounced in the last 6 months and you're looking at unsecured credit. New borrowing here usually deepens a cycle, not breaks it.`,
    )
    suggestions.push(
      'First refinance the high-cost app loans into one lower-rate secured loan (gold/property), then borrow for the scooter.',
    )
    return block(input, product, reasons, suggestions, productive)
  }

  // Stress fails badly — a single shock sinks repayment.
  if (!stressSurvives && surplus < inc * 0.1) {
    reasons.push(
      `Under a stress case (income drop or rate rise) you would fall short. With such a thin margin, one bad month becomes a default.`,
    )
    return block(input, product, reasons, suggestions, productive)
  }

  // --- BORROW LESS ---
  if (safeAmount > 0 && wanted > safeAmount * 1.1) {
    reasons.push(
      `You want ₹${fmt(wanted)} but you can safely carry only ₹${fmt(
        safeAmount,
      )}. Borrowing the full amount would push EMI past your safe ceiling.`,
    )
    if (product.secured) {
      suggestions.push(
        `Stretch tenure to ${product.tenureMax}y or add a co-applicant to lift the safe amount toward what you need.`,
      )
    }
    return {
      verdict: 'borrow-less',
      headline: `Borrow less — about ₹${fmt(safeAmount)} for now`,
      reasons,
      suggestions,
      isProductive: productive,
    }
  }

  // --- BORROW (with honest caveats) ---
  reasons.push(
    `You can safely carry ₹${fmt(safeAmount)} — enough for the ₹${fmt(
      wanted,
    )} you want, with a buffer left for shocks.`,
  )
  if (product.secured) {
    reasons.push(
      `Routed to ${product.name}: collateral keeps the rate down and the lender's risk low.`,
    )
  } else {
    reasons.push(`${product.name} is unsecured; keep the amount lean and tenure short.`)
  }
  if (productive) {
    reasons.push(
      `This loan should add ~₹${fmt(
        input.monthlyIncomeFromLoan!,
      )}/mo — that income partly self-pays the EMI, which is why borrowing makes sense here.`,
    )
  }
  if (band === 'unknown' || band === 'none') {
    suggestions.push(
      'Check your CIBIL score before you walk in — if it is above 750, ask for the lower end of the band.',
    )
  }

  return {
    verdict: 'borrow',
    headline: `Borrow — but on these terms`,
    reasons,
    suggestions,
    isProductive: productive,
  }
}

function block(
  input: BorrowerInput,
  product: Product,
  reasons: string[],
  suggestions: string[],
  productive: boolean,
): BorrowVerdictResult {
  // App-loan / high-cost trap: the most useful move is usually to refinance
  // the existing high-cost debt, not to stack new borrowing on top of it.
  const trapSignals = (input.activeLoanCount ?? 0) >= 2 || (input.bouncesLast6m ?? 0) >= 1
  if (trapSignals) {
    const route =
      input.collateralKind === 'gold'
        ? 'a gold loan'
        : input.collateralKind === 'property'
          ? 'a Loan Against Property'
          : 'a single personal-loan consolidation'
    suggestions.unshift(
      `First refinance your high-cost existing loans into ${route} — one lower EMI frees up cash flow before you borrow more.`,
    )
  }
  // If there is a secured path we couldn't take, suggest it.
  if (!product.secured) {
    if (input.collateralKind === 'property') {
      suggestions.push('Pledge your property for a Loan Against Property — far cheaper, and the verdict may flip.')
    } else if (input.collateralKind === 'gold') {
      suggestions.push('A gold loan against family gold is the cheapest secured route here.')
    }
  }
  if (input.coApplicantIncome === undefined && input.incomeType !== 'salaried') {
    suggestions.push('A co-applicant with stable income raises both eligibility and the safe ceiling.')
  }
  if (productive) {
    reasons.push(
      'Even though this loan is productive, it has to be affordable *before* the new income arrives — that income is not guaranteed.',
    )
  }
  return {
    verdict: 'dont-borrow',
    headline: "Don't borrow — not like this",
    reasons,
    suggestions,
    isProductive: productive,
  }
}

const fmt = (n: number) =>
  Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
