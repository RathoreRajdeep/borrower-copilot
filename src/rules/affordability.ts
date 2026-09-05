import type { BorrowerInput } from '../types'

// --- Effective (conservative) income ---
// Lenders and a careful borrower should not plan on the best month.
// Salaried: take the stated figure.
// Self-employed with ITR: take the documented figure (ITR/12) — lenders do.
// Informal / variable: take the *lower* band, then haircut for volatility.
export function effectiveIncome(input: BorrowerInput): number {
  if (input.incomeType === 'salaried') {
    return input.incomeStated ?? input.incomeHigh ?? input.incomeLow ?? 0
  }
  // self-employed / informal
  const documented = input.hasITR ? input.incomeStated ?? 0 : 0
  const cashLow = input.incomeLow ?? 0
  const base = Math.max(documented, cashLow)
  // Informal incomes bounce around — plan on 85% of the floor.
  const haircut = input.incomeType === 'informal' ? 0.85 : 0.9
  return base * haircut
}

// Total household income, including a co-applicant (for eligibility,
// not for the borrower's *own* safety ceiling — that uses personal income).
export function householdIncome(input: BorrowerInput): number {
  return effectiveIncome(input) + (input.coApplicantIncome ?? 0)
}

// --- Lender FOIR limit ---
// Fixed Obligations to Income Ratio = (all EMIs) / income.
// Indian lenders sanction while FOIR stays under a ceiling that depends on
// income type. These are the *lender's* guardrails — not the borrower's.
export function lenderFoirLimit(input: BorrowerInput): number {
  switch (input.incomeType) {
    case 'salaried':
      return 0.55
    case 'self-employed':
      return 0.5
    case 'informal':
      return 0.45
  }
}

// The most EMI a lender will accept (household view, includes co-applicant).
export function lenderEmiCap(input: BorrowerInput): number {
  const inc = householdIncome(input)
  return inc * lenderFoirLimit(input) - input.existingEMIs
}

// --- Borrower's safe surplus ---
// Money left after real living costs and existing EMIs — the only honest
// pool a new EMI can come from. A co-applicant spouse's income is real
// household money, so it counts toward the safe pool — but only 70% of it,
// because it is not under the primary borrower's control and may stop.
export function safeSurplus(input: BorrowerInput): number {
  const inc = effectiveIncome(input)
  const co = (input.coApplicantIncome ?? 0) * 0.7
  const surgeReserve = input.upcomingLargeExpense
    ? (input.upcomingLargeExpense ?? 0) / 12
    : 0
  return inc + co - input.householdExpenses - input.existingEMIs - surgeReserve
}

// What share of safe surplus should become an EMI? Not all of it — a buffer
// must remain for shocks. The buffer grows when savings are thin or the
// household has more dependents relying on the same income.
export function safeEmiShare(input: BorrowerInput): number {
  const savings = input.emergencySavingsMonths ?? 0
  const dependents = input.dependents ?? 0
  let share = 0.6
  if (savings < 1) share = 0.35
  else if (savings < 3) share = 0.5
  // each dependent above 1 trims 5pts off the share (floored at 0.3)
  if (dependents > 1) share = Math.max(0.3, share - (dependents - 1) * 0.05)
  return share
}

// The EMI the borrower can *safely* carry, regardless of what a lender offers.
export function safeEmiCeiling(input: BorrowerInput): number {
  const surplus = safeSurplus(input)
  if (surplus <= 0) return 0
  return surplus * safeEmiShare(input)
}

// The binding EMI ceiling — the smaller of "what a lender allows" and
// "what you can safely carry". We return both so the UI can show which binds.
export function bindingEmiCeiling(input: BorrowerInput): {
  ceiling: number
  binding: 'lender' | 'borrower'
  lenderCap: number
  borrowerCap: number
} {
  const lenderCap = Math.max(0, lenderEmiCap(input))
  const borrowerCap = Math.max(0, safeEmiCeiling(input))
  const ceiling = Math.min(lenderCap, borrowerCap)
  return {
    ceiling,
    binding: lenderCap <= borrowerCap ? 'lender' : 'borrower',
    lenderCap,
    borrowerCap,
  }
}
