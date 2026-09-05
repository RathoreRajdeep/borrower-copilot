import type { BorrowerInput } from '../types'
import type { Product } from './products'
import { principalForEmi } from './emi'
import { bindingEmiCeiling, householdIncome, lenderFoirLimit } from './affordability'

export interface MaxAmountResult {
  lenderSanction: number // what a lender will likely approve
  borrowerSafe: number // what the borrower can safely carry
  recommend: number // the smaller of the two — what to actually borrow
  ltvCap: number | null // collateral-imposed ceiling, if any
  reason: string
  bindsLender: boolean
  bindsBorrower: boolean
}

export function computeMaxAmount(
  input: BorrowerInput,
  product: Product,
  fairRate: number,
  tenureYears: number,
): MaxAmountResult {
  const months = Math.round(tenureYears * 12)
  const { lenderCap, borrowerCap } = bindingEmiCeiling(input)

  // Amount each EMI ceiling supports at the fair rate.
  const fromLenderCap = principalForEmi(Math.max(0, lenderCap), fairRate, months)
  const fromBorrowerCap = principalForEmi(Math.max(0, borrowerCap), fairRate, months)

  let lenderSanction = fromLenderCap
  let ltvCap: number | null = null

  // Secured product: the collateral caps the amount (LTV).
  if (product.secured && input.collateralValue && input.collateralValue > 0) {
    ltvCap = input.collateralValue * product.ltvMax
    lenderSanction = Math.min(lenderSanction, ltvCap)
  }

  const borrowerSafe = fromBorrowerCap
  const recommend = Math.min(lenderSanction, borrowerSafe)
  const bindsBorrower = borrowerCap < lenderCap
  const bindsLender = !bindsBorrower

  const foir = (input.existingEMIs / Math.max(1, householdIncome(input))) * 100
  const reason = bindsBorrower
    ? `Your safe monthly surplus only supports ₹${fmt(borrowerSafe)}, even though a lender might sanction ₹${fmt(
        lenderSanction,
      )} (FOIR ${(lenderFoirLimit(input) * 100) | 0}% vs your existing ${Math.round(foir)}%). Borrow the safe number.`
    : ltvCap !== null && lenderSanction === ltvCap
      ? `The lender's sanction is capped by your collateral at ${Math.round(
          product.ltvMax * 100,
        )}% LTV = ₹${fmt(ltvCap)}, not by income. You can safely carry this.`
      : `Both the lender's FOIR limit and your safe surplus allow ₹${fmt(
          recommend,
        )}. This is the number to use.`

  return {
    lenderSanction: Math.round(lenderSanction),
    borrowerSafe: Math.round(borrowerSafe),
    recommend: Math.round(recommend),
    ltvCap: ltvCap === null ? null : Math.round(ltvCap),
    reason,
    bindsLender,
    bindsBorrower,
  }
}

const fmt = (n: number) =>
  n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
