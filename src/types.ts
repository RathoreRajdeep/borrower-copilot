// The borrower's self-assessment data model.
// Everything the app outputs is a pure function of these inputs — no ML, no API.

export type IncomeType = 'salaried' | 'self-employed' | 'informal'

export type LoanPurpose =
  | 'home'
  | 'property' // Loan Against Property (LAP)
  | 'personal'
  | 'wedding'
  | 'vehicle' // two-wheeler / car for personal use
  | 'business'
  | 'gold'
  | 'other'

// What a "don't know" answer becomes internally — never a number, never zero.
export type Unknown<T> = T | 'unknown'

export interface BorrowerInput {
  // --- Must questions (8) ---
  purpose: LoanPurpose
  amountWanted: number
  incomeType: IncomeType
  // Net monthly income. For variable incomes we keep the range and a
  // conservative figure is derived in the rules (see effectiveIncome).
  incomeLow?: number // lower bound of a typical month
  incomeHigh?: number // upper bound (== incomeLow for salaried)
  incomeStated?: number // single figure if they give one
  existingEMIs: number
  householdExpenses: number
  age: number
  // Credit score: a number if known, 'unknown' if not, 'none' if no history.
  creditScore: Unknown<number> | 'none'

  // --- Additional questions (each one moves an output) ---
  yearsInIncome?: number // stability of current income source
  hasITR?: boolean // documented income for self-employed / informal

  // existing-obligation detail
  activeLoanCount?: number
  bouncesLast6m?: number
  cardUtilisationPct?: number // outstanding / limit, 0-100

  // buffers & resilience
  emergencySavingsMonths?: number // months of expenses saved
  dependents?: number

  // secured routing
  collateralValue?: number // property/gold they can pledge
  collateralKind?: 'property' | 'gold' | 'vehicle' | 'none'

  // income boost
  coApplicantIncome?: number
  monthlyIncomeFromLoan?: number // if the loan is productive

  // offers already received (to compare against fair band)
  offeredRate?: number

  // tenure preference
  tenureYears?: number

  // upcoming stress
  upcomingLargeExpense?: number
}

// Helper to read a credit score as a number, or undefined.
export function scoreNumber(s: BorrowerInput['creditScore']): number | undefined {
  if (s === 'unknown' || s === 'none') return undefined
  return s
}
