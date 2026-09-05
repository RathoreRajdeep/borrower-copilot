import { PERSONAS } from '../src/data/personas'
import { assess } from '../src/rules'
import { inr } from '../src/lib/format'

for (const p of PERSONAS) {
  const a = assess(p.input)
  console.log('\n==============================')
  console.log(`${p.who} — ${p.where}`)
  console.log(`Wants ${inr(p.input.amountWanted)} (${p.input.purpose})`)
  console.log('------------------------------')
  console.log('O1 Verdict:', a.verdict.verdict.toUpperCase(), '—', a.verdict.headline)
  a.verdict.reasons.forEach((r) => console.log('   -', r))
  if (a.verdict.suggestions.length) console.log('   suggestions:')
  a.verdict.suggestions.forEach((s) => console.log('     →', s))
  console.log('------------------------------')
  console.log('O2 Max amount:')
  console.log('   lender sanction  :', inr(a.amount.lenderSanction))
  console.log('   borrower safe    :', inr(a.amount.borrowerSafe))
  console.log('   recommend        :', inr(a.amount.recommend))
  if (a.amount.ltvCap) console.log('   LTV cap          :', inr(a.amount.ltvCap))
  console.log('   ', a.amount.reason)
  console.log('------------------------------')
  console.log('O3 Fair rate:')
  console.log('   band             :', `${a.rate.bandLow}% – ${a.rate.bandHigh}%`)
  console.log('   fair rate        :', `${a.rate.fairRate}%`)
  console.log('   APR (all-in)     :', `${a.rate.aprPct}%`)
  console.log('   confidence       :', a.rate.confidence)
  a.rate.reasons.forEach((r) => console.log('   -', r))
  console.log('------------------------------')
  console.log('O4 EMI:')
  console.log('   ceiling          :', `${inr(a.emi.ceiling)}/mo (binds: ${a.emi.binding})`)
  console.log('   recommended ten. :', `${a.emi.recommendedTenure.years}y → EMI ${inr(a.emi.recommendedTenure.emi)}, amt ${inr(a.emi.recommendedTenure.amount)}`)
  a.emi.tenureOptions.forEach((t) =>
    console.log(`     ${t.years}y: EMI ${inr(t.emi)}, amt ${inr(t.amount)}, int ${inr(t.totalInterest)}`),
  )
  console.log('   stress           :', a.emi.stress.scenario, '→ surplus', inr(a.emi.stress.newSurplus), a.emi.stress.survives ? '✓ survives' : `✗ short by ${inr(a.emi.stress.shortfall)}`)
  console.log('------------------------------')
  console.log('Card:', a.card.verdictLine)
  console.log('   band', a.card.rateBand, '| APR', a.card.aprPct + '%', '| EMI ceil', inr(a.card.emiCeiling))
}
