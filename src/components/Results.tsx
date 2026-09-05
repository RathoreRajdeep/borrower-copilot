import type { BorrowerInput } from '../types'
import type { Assessment } from '../rules'
import { inr, inrShort, pct } from '../lib/format'
import NegotiationCard from './NegotiationCard'

interface Props {
  assessment: Assessment
  input: BorrowerInput
  onRestart: () => void
  onEdit: () => void
}

export default function Results({ assessment, input, onRestart, onEdit }: Props) {
  const { verdict, amount, rate, emi, product, confidence } = assessment

  const verdictTone = verdict.verdict === 'borrow' ? 'good' : 'warn'
  const verdictBg =
    verdict.verdict === 'borrow'
      ? 'border-[var(--good)]'
      : 'border-[var(--warn)]'

  return (
    <div className="bg-app min-h-screen">
      <div className="mx-auto max-w-3xl px-5 pb-20">
        <header className="pt-10 pb-6 border-b border-rule">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted">Your four answers</p>
            <ConfidenceBadge level={confidence} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
            {product.name} · ₹{inr(input.amountWanted)} for {input.tenureYears ?? assessment.tenureYears} years
          </h1>
        </header>

        <section className="mt-8">
          <OutputLabel n="O1" label="Should you borrow at all?" />
          <div className={`rounded-xl border-2 p-5 ${verdictBg}`} style={{ background: 'var(--bg2)' }}>
            <h2 className={`font-display text-2xl ${verdictTone === 'good' ? 'text-good' : 'text-warn'}`}>
              {verdict.headline}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {verdict.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {verdict.suggestions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-rule">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">A better path</p>
                <ul className="space-y-1.5 text-sm">
                  {verdict.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-warn">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <OutputLabel n="O2" label="How much can you really take?" />
          <div className="grid sm:grid-cols-2 gap-4">
            <NumberCard
              title="A lender will likely sanction"
              value={`₹${inr(amount.lenderSanction)}`}
              sub={amount.ltvCap ? `capped by collateral LTV` : 'based on FOIR + income'}
              muted
            />
            <NumberCard
              title="You can safely carry"
              value={`₹${inr(amount.borrowerSafe)}`}
              sub="after expenses, EMIs and a buffer"
              highlight
            />
          </div>
          <div className="mt-4 p-4 rounded-md bg-soft border border-rule">
            <p className="text-sm">
              <b className="text-accent">Use ₹{inr(amount.recommend)}.</b> {amount.reason}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <OutputLabel n="O3" label="What's a fair rate for you?" />
          <div className="rounded-xl border border-rule p-5">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-muted uppercase tracking-wide">Fair rate band</div>
                <div className="font-mono text-3xl text-accent">
                  {pct(rate.bandLow)} – {pct(rate.bandHigh)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted uppercase tracking-wide">All-in APR</div>
                <div className="font-mono text-2xl text-warn">{pct(rate.aprPct)}</div>
                <div className="text-xs text-muted">incl. {pct(rate.feePct)} fee + 18% GST</div>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {rate.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <OutputLabel n="O4" label="What EMI should you agree to?" />
          <div className="rounded-xl border border-rule p-5">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-muted uppercase tracking-wide">Monthly ceiling — don't cross</div>
                <div className="font-mono text-3xl">₹{inr(emi.ceiling)}/mo</div>
              </div>
              <div className="text-right text-xs text-muted">
                binds on the <b className="text-ink">{emi.binding}</b> side
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{emi.reason}</p>

            {emi.ceiling > 0 ? (
              <div className="mt-5">
                <div className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">
                  Tenure trade-off (same EMI ceiling)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rule text-xs text-muted uppercase tracking-wide">
                        <th className="text-left py-2 font-semibold">Tenure</th>
                        <th className="text-right py-2 font-semibold">EMI</th>
                        <th className="text-right py-2 font-semibold">Amount</th>
                        <th className="text-right py-2 font-semibold">Total interest</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {emi.tenureOptions.map((t) => {
                        const rec = t.years === emi.recommendedTenure.years
                        return (
                          <tr key={t.years} className={rec ? 'bg-accent-soft' : ''} style={rec ? { background: 'var(--accent-soft)' } : {}}>
                            <td className="py-2">
                              {t.years} yrs{rec ? <span className="text-accent"> ✓</span> : ''}
                            </td>
                            <td className="text-right py-2">₹{inr(t.emi)}</td>
                            <td className="text-right py-2">{inrShort(t.amount)}</td>
                            <td className="text-right py-2 text-muted">{inrShort(t.totalInterest)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-5 p-4 rounded-md border border-[var(--warn)]" style={{ background: 'var(--bg2)' }}>
                <p className="text-sm text-warn">
                  There is no room for any new EMI after your expenses and existing obligations — so there is
                  no safe tenure to show. Don't borrow until cash flow opens up.
                </p>
              </div>
            )}

            <div className="mt-5 p-4 rounded-md bg-soft border border-rule">
              <div className="text-xs font-semibold tracking-widest uppercase text-muted">Stress test</div>
              <p className="text-sm mt-1">
                If <b>{emi.stress.scenario}</b>, your spare cash falls to{' '}
                <b className={emi.stress.survives ? 'text-good' : 'text-warn'}>
                  ₹{inr(emi.stress.newSurplus)}/mo
                </b>
                .
              </p>
              <p className={`text-sm mt-1 ${emi.stress.survives ? 'text-good' : 'text-warn'}`}>
                {emi.stress.survives
                  ? 'You survive the shock — the EMI is still payable.'
                  : `You'd fall short by ₹${inr(emi.stress.shortfall)}/mo. Borrow less or build a buffer first.`}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <OutputLabel n="★" label="Your Negotiation Card" />
          <NegotiationCard assessment={assessment} offeredRate={input.offeredRate} />
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={onEdit} className="px-5 py-2.5 rounded-md border border-rule hover:border-[var(--accent)] transition">
            Edit my answers
          </button>
          <button onClick={onRestart} className="px-5 py-2.5 rounded-md border border-rule hover:border-[var(--accent)] transition">
            Start over
          </button>
          <button onClick={() => window.print()} className="px-5 py-2.5 rounded-md border border-rule hover:border-[var(--accent)] transition">
            Print / save card
          </button>
        </div>

        <footer className="mt-12 pt-6 border-t border-rule text-xs text-muted">
          These numbers come from the rules in RULES.md — every threshold, band and haircut. Nothing here is stored or sent anywhere.
          {confidence === 'wide' && ' Because you skipped some questions, bands are wide and confidence is low — answer more to tighten them.'}
        </footer>
      </div>
    </div>
  )
}

function OutputLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-mono text-sm text-accent">{n}</span>
      <h2 className="font-display text-xl">{label}</h2>
    </div>
  )
}

function NumberCard({
  title,
  value,
  sub,
  muted,
  highlight,
}: {
  title: string
  value: string
  sub: string
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-4 border ${highlight ? 'border-[var(--accent)] bg-accent-soft' : 'border-rule bg-soft'}`}>
      <div className="text-xs text-muted uppercase tracking-wide">{title}</div>
      <div className={`font-mono text-2xl mt-1 ${muted ? 'text-muted' : 'text-ink'}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{sub}</div>
    </div>
  )
}

function ConfidenceBadge({ level }: { level: 'wide' | 'medium' | 'tight' }) {
  const map = {
    wide: { label: 'Low confidence · wide bands', cls: 'text-warn border-[var(--warn)]' },
    medium: { label: 'Medium confidence', cls: 'text-muted border-rule' },
    tight: { label: 'Tight estimates', cls: 'text-good border-[var(--good)]' },
  }[level]
  return <span className={`text-xs font-mono px-2 py-1 rounded border ${map.cls}`}>{map.label}</span>
}
