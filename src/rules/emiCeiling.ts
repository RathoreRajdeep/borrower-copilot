import type { BorrowerInput } from '../types'
import type { Product } from './products'
import { emi, principalForEmi } from './emi'
import { bindingEmiCeiling, effectiveIncome, safeSurplus } from './affordability'

export interface TenureOption {
  years: number
  emi: number
  amount: number
  totalInterest: number
}

export interface StressCase {
  scenario: string
  newIncome: number
  newSurplus: number
  // Can the borrower still pay the ceiling EMI after the shock?
  survives: boolean
  shortfall: number
}

export interface EmiCeilingResult {
  ceiling: number
  binding: 'lender' | 'borrower'
  tenureOptions: TenureOption[]
  recommendedTenure: TenureOption
  stress: StressCase
  reason: string
}

export function computeEmiCeiling(
  input: BorrowerInput,
  product: Product,
  fairRate: number,
  amountToBorrow: number,
): EmiCeilingResult {
  const { ceiling, binding, lenderCap, borrowerCap } = bindingEmiCeiling(input)
  const useCeiling = Math.max(0, ceiling)

  // Tenure trade-off: same ceiling EMI buys different amounts/tenures.
  const tenureOptions: TenureOption[] = []
  for (const years of [product.tenureMin, 3, 5, 7, 10, product.tenureMax]) {
    if (years < product.tenureMin || years > product.tenureMax) continue
    const months = years * 12
    const amt = principalForEmi(useCeiling, fairRate, months)
    const totalInt = useCeiling * months - amt
    tenureOptions.push({ years, emi: useCeiling, amount: amt, totalInterest: totalInt })
  }
  // de-duplicate by years (min/max can equal fixed options)
  const seen = new Set<number>()
  const unique = tenureOptions
    .filter((o) => (seen.has(o.years) ? false : (seen.add(o.years), true)))
    .sort((a, b) => a.years - b.years)

  // Recommended tenure: smallest tenure where the actual borrow amount fits
  // the EMI ceiling. Allow a ₹1 tolerance for floating-point rounding.
  const recommendedTenure =
    unique.find((o) => o.amount >= amountToBorrow - 1) ?? unique[unique.length - 1]

  // --- Stress case ---
  // Two shocks: income falls 15% (primary borrower only; co-applicant income
  // is still there) OR rate rises 200bps. We test whether the borrower can
  // still pay the committed EMI after each shock — not just whether they
  // have positive cash. The committed EMI is on the amount they'll actually
  // borrow at the fair rate, for the recommended tenure.
  const committedEmi = emi(amountToBorrow, fairRate, recommendedTenure.years * 12)
  const coApp = (input.coApplicantIncome ?? 0) * 0.7
  const surgeReserve = input.upcomingLargeExpense
    ? (input.upcomingLargeExpense ?? 0) / 12
    : 0

  // Income shock: primary income drops 15%, co-applicant income unchanged.
  const incomeShock = effectiveIncome(input) * 0.85
  const incomeFreeCash =
    incomeShock + coApp - input.householdExpenses - input.existingEMIs - surgeReserve
  const incomeRemaining = incomeFreeCash - committedEmi

  // Rate shock: EMI rises on the actual borrow amount.
  const stressedRate = fairRate + 2
  const stressedEmi = emi(amountToBorrow, stressedRate, recommendedTenure.years * 12)
  const rateRemaining = safeSurplus(input) - stressedEmi

  const worse = Math.min(incomeRemaining, rateRemaining)

  const stress: StressCase = {
    scenario:
      incomeRemaining <= rateRemaining ? 'income drops 15%' : 'interest rate rises 2%',
    newIncome: Math.round(incomeShock + coApp),
    newSurplus: Math.round(worse),
    survives: worse >= 0,
    shortfall: Math.round(Math.max(0, -worse)),
  }

  const reason =
    binding === 'borrower'
      ? `₹${fmt(ceiling)}/mo, not ₹${fmt(lenderCap)} — the lender would allow more, but after ₹${fmt(
          input.householdExpenses,
        )} expenses and ₹${fmt(input.existingEMIs)} EMIs your safe surplus is ₹${fmt(
          safeSurplus(input),
        )}, and we keep a buffer so a bad month doesn't break you.`
      : `₹${fmt(ceiling)}/mo — this is the lender's FOIR ceiling for your income. Your own safe surplus would allow ₹${fmt(
          borrowerCap,
        )}, so the lender binds here.`

  return {
    ceiling: Math.round(ceiling),
    binding,
    tenureOptions: unique.map((o) => ({
      years: o.years,
      emi: Math.round(o.emi),
      amount: Math.round(o.amount),
      totalInterest: Math.round(o.totalInterest),
    })),
    recommendedTenure: {
      years: recommendedTenure.years,
      emi: Math.round(recommendedTenure.emi),
      amount: Math.round(recommendedTenure.amount),
      totalInterest: Math.round(recommendedTenure.totalInterest),
    },
    stress,
    reason,
  }
}

const fmt = (n: number) =>
  Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
