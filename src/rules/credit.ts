import type { BorrowerInput } from '../types'
import { scoreNumber } from '../types'

export type ScoreBand =
  | 'excellent' // 800+
  | 'good' // 750-799
  | 'fair' // 700-749
  | 'average' // 650-699
  | 'weak' // 600-649
  | 'poor' // <600
  | 'unknown' // "I don't know"
  | 'none' // no history at all

export function scoreBand(input: BorrowerInput): ScoreBand {
  const s = scoreNumber(input.creditScore)
  if (s === undefined) return input.creditScore === 'none' ? 'none' : 'unknown'
  if (s >= 800) return 'excellent'
  if (s >= 750) return 'good'
  if (s >= 700) return 'fair'
  if (s >= 650) return 'average'
  if (s >= 600) return 'weak'
  return 'poor'
}

// How much to nudge the rate band off the product's neutral band, in
// percentage points. Negative = cheaper than neutral.
export function rateAdjustmentPP(input: BorrowerInput): { delta: number; reasons: string[] } {
  const reasons: string[] = []
  let delta = 0
  switch (scoreBand(input)) {
    case 'excellent':
      delta -= 1.0
      reasons.push('credit score 800+ is top-tier (−1.0%)')
      break
    case 'good':
      delta -= 0.5
      reasons.push('credit score 750–799 is strong (−0.5%)')
      break
    case 'fair':
      reasons.push('credit score 700–749 is market-average')
      break
    case 'average':
      delta += 0.5
      reasons.push('credit score 650–699 is below average (+0.5%)')
      break
    case 'weak':
      delta += 1.5
      reasons.push('credit score 600–649 is weak (+1.5%)')
      break
    case 'poor':
      delta += 3.0
      reasons.push('credit score below 600 is high-risk (+3.0%)')
      break
    case 'unknown':
      delta += 0.5
      reasons.push("score unknown — assumed market-average with a small caution (+0.5%)")
      break
    case 'none':
      delta += 1.0
      reasons.push('no credit history — a thin-file premium applies (+1.0%)')
      break
  }

  // Income type stability
  if (input.incomeType === 'salaried' && (input.yearsInIncome ?? 0) >= 3) {
    delta -= 0.25
    reasons.push('salaried 3+ years at current source (−0.25%)')
  }
  if (input.incomeType === 'informal') {
    delta += 0.75
    reasons.push('informal/gig income is volatile (+0.75%)')
  }

  // Behavioural red flags
  const bounces = input.bouncesLast6m ?? 0
  if (bounces >= 1) {
    delta += 1.0
    reasons.push(`${bounces} EMI bounce${bounces > 1 ? 's' : ''} in 6 months (+1.0%)`)
  }
  const util = input.cardUtilisationPct
  if (util !== undefined) {
    if (util > 75) {
      delta += 0.5
      reasons.push(`card utilisation ${Math.round(util)}% is overextended (+0.5%)`)
    } else if (util < 30) {
      delta -= 0.25
      reasons.push(`card utilisation ${Math.round(util)}% is healthy (−0.25%)`)
    }
  }

  return { delta, reasons }
}
