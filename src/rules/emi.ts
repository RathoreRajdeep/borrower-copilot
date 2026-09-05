// Pure financial math: EMI, present value, and all-in APR.
// No rounding here — callers round for display. Every formula is documented
// in RULES.md with its source.

// Monthly EMI on a reducing-balance loan.
// EMI = P * r * (1+r)^n / ((1+r)^n - 1),  r = monthlyRate, n = months.
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / months
  const f = Math.pow(1 + r, months)
  return (principal * r * f) / (f - 1)
}

// Total interest paid over the life of the loan.
export function totalInterest(principal: number, annualRatePct: number, months: number): number {
  return emi(principal, annualRatePct, months) * months - principal
}

// Solve for the annual percentage rate (APR) that equates the *net amount
// disbursed* (principal minus processing fee, the real money in hand) to the
// present value of the EMI stream. This is the RBI-style "all-in cost".
// We use bisection — cheap, robust, no derivative needed.
export function apr(
  principal: number,
  annualRatePct: number,
  months: number,
  feePctOfPrincipal: number,
): number {
  const fee = (principal * feePctOfPrincipal) / 100
  const disbursed = principal - fee
  if (disbursed <= 0) return 0
  const e = emi(principal, annualRatePct, months)
  // PV of EMIs at rate x: sum e/(1+x/12)^t, t=1..months
  const pv = (x: number) => {
    const m = x / 100 / 12
    if (m === 0) return e * months
    let s = 0
    for (let t = 1; t <= months; t++) s += e / Math.pow(1 + m, t)
    return s
  }
  let lo = 0
  let hi = Math.max(annualRatePct + 10, 60)
  // fee can't make APR worse than ~60% in sane cases
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (pv(mid) > disbursed) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// Principal affordable for a given EMI, rate and tenure.
// Inverts the EMI formula: P = EMI * ((1+r)^n - 1) / (r * (1+r)^n).
export function principalForEmi(emiCeiling: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return emiCeiling * months
  const f = Math.pow(1 + r, months)
  return (emiCeiling * (f - 1)) / (r * f)
}
