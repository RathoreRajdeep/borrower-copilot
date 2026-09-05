import type { Assessment } from '../rules'
import { inr, pct } from '../lib/format'

interface Props {
  assessment: Assessment
  offeredRate?: number
}

export default function NegotiationCard({ assessment, offeredRate }: Props) {
  const c = assessment.card
  const verdictColor =
    assessment.verdict.verdict === 'borrow'
      ? 'text-good'
      : 'text-warn'

  return (
    <div className="bg-accent-soft border-2 border-[var(--accent)] rounded-xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted">Negotiation Card</p>
          <h3 className="font-display text-2xl mt-1">
            {c.product} · {c.secured ? 'Secured' : 'Unsecured'}
          </h3>
        </div>
        <div className={`font-display text-xl ${verdictColor}`}>{c.verdictLine}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <Stat label="Safe to borrow" value={`₹${inr(c.safeAmount)}`} />
        <Stat label="Lender may sanction" value={`₹${inr(c.lenderSanction)}`} muted />
        <Stat label="Fair rate band" value={c.rateBand} />
        <Stat label="All-in APR" value={pct(c.aprPct)} />
        <Stat label="EMI ceiling" value={`₹${inr(c.emiCeiling)}/mo`} />
        <Stat label="Tenure" value={`${c.tenure} yrs`} />
        <Stat label="Your fair rate" value={pct(c.fairRate)} />
        <Stat label={c.scoreLine} value="" small />
      </div>

      <div className="mt-6 border-t border-rule pt-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">Why these numbers</p>
        <ul className="space-y-1.5 text-sm">
          {c.because.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {offeredRate !== undefined && (
        <div className="mt-5 p-3 rounded-md bg-app border border-rule text-sm">
          <b>Lender quoted you {pct(offeredRate)}.</b>{' '}
          {offeredRate > assessment.rate.bandHigh ? (
            <span className="text-warn">
              That's above your fair band of {c.rateBand} — push back, or find another lender.
            </span>
          ) : offeredRate < assessment.rate.bandLow ? (
            <span className="text-good">That's below your fair band — a good deal.</span>
          ) : (
            <span className="text-good">That's inside your fair band — reasonable for your profile.</span>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-muted font-mono">
        Show this to the lender. "Fair for my profile is {c.rateBand}, because my safe EMI ceiling is
        ₹{inr(c.emiCeiling)}/mo and the all-in APR I should pay is {pct(c.aprPct)}."
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  muted,
  small,
}: {
  label: string
  value: string
  muted?: boolean
  small?: boolean
}) {
  return (
    <div>
      <div className={`font-mono ${small ? 'text-xs' : 'text-xl'} ${muted ? 'text-muted' : 'text-ink'}`}>
        {value || '—'}
      </div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
