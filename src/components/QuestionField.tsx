import { useRef, useState } from 'react'
import type { Question } from '../questions/schema'
import type { BorrowerInput } from '../types'
import { groupIndian, parseGrouped, toWordsIndian } from '../lib/format'

interface Props {
  question: Question
  input: BorrowerInput
  onAnswer: (writes: Partial<BorrowerInput>) => void
}

const inputClass =
  'w-full bg-app border border-rule rounded-md px-3 py-2.5 text-lg tnum focus:border-[var(--accent)] outline-none'

function hasValue(s: string): boolean {
  return s.replace(/[,\s₹]/g, '').length > 0
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-4 font-semibold px-6 py-2.5 rounded-md transition ${
        disabled
          ? 'bg-soft text-muted border border-rule cursor-not-allowed'
          : 'bg-accent text-on-accent hover:opacity-90'
      }`}
    >
      Next →
    </button>
  )
}

// A controlled money/number input: live Indian grouping + words preview.
function GroupedInput({
  refEl,
  isMoney,
  placeholder,
  onKeyDown,
  onChange,
  autoFocus,
  initial,
}: {
  refEl: React.RefObject<HTMLInputElement | null>
  isMoney: boolean
  placeholder?: string
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onChange: (raw: string, num: number) => void
  autoFocus?: boolean
  initial?: string
}) {
  const [text, setText] = useState(initial ?? '')

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {isMoney && <span className="text-2xl text-muted font-mono">₹</span>}
        <input
          ref={refEl}
          type="text"
          inputMode="numeric"
          value={text}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={inputClass}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            const raw = e.target.value
            // Cap at 12 digits (~₹1,000 crore) — beyond any real Indian loan
            // and prevents absurd "crore crore" words output.
            const digits = raw.replace(/[^\d]/g, '').slice(0, 12)
            const grouped = groupIndian(digits)
            setText(grouped)
            onChange(grouped, parseGrouped(grouped))
          }}
        />
      </div>
      {hasValue(text) && (
        <p className="text-xs text-muted mt-1.5 italic">
          {toWordsIndian(parseGrouped(text))}{isMoney ? ' rupees' : ''}
        </p>
      )}
    </div>
  )
}

export default function QuestionField({ question, input, onAnswer }: Props) {
  const f = question.field
  const mainRef = useRef<HTMLInputElement>(null)
  const lowRef = useRef<HTMLInputElement>(null)
  const highRef = useRef<HTMLInputElement>(null)
  const [hasMain, setHasMain] = useState(false)
  const [hasLow, setHasLow] = useState(false)
  const [hasHigh, setHasHigh] = useState(false)

  // select: one click answers + advances
  if (f === 'select') {
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        {question.options!.map((o) => {
          const current = String((input as unknown as Record<string, unknown>)[question.writes[0] as string] ?? '')
          const selected = current === o.value
          return (
            <button
              key={o.value}
              onClick={() => onAnswer({ [question.writes[0]]: o.value } as Partial<BorrowerInput>)}
              className={`text-left px-4 py-3 rounded-md border transition ${
                selected
                  ? 'bg-accent-soft border-[var(--accent)] text-ink'
                  : 'bg-app border-rule hover:border-[var(--accent)]'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }

  // boolean: one click answers + advances
  if (f === 'boolean') {
    const val = (input as unknown as Record<string, unknown>)[question.writes[0] as string] as boolean | undefined
    return (
      <div className="flex gap-2">
        {[
          { v: true, l: 'Yes' },
          { v: false, l: 'No' },
        ].map((o) => (
          <button
            key={String(o.v)}
            onClick={() => onAnswer({ [question.writes[0]]: o.v } as Partial<BorrowerInput>)}
            className={`px-5 py-2.5 rounded-md border transition ${
              val === o.v
                ? 'bg-accent-soft border-[var(--accent)]'
                : 'bg-app border-rule hover:border-[var(--accent)]'
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    )
  }

  // score: mode buttons + optional input (plain number, 300-900, no grouping/words)
  if (f === 'score') {
    const score = input.creditScore
    const [mode, setMode] = useState<string>(
      typeof score === 'number'
        ? 'known'
        : score === 'unknown'
          ? 'unknown'
          : score === 'none'
            ? 'none'
            : '',
    )
    const [scoreText, setScoreText] = useState(typeof score === 'number' ? String(score) : '')
    const scoreValid = hasValue(scoreText) && parseGrouped(scoreText) > 0
    const submitScore = () => {
      if (!scoreValid) return
      onAnswer({ creditScore: Math.max(300, Math.min(900, parseGrouped(scoreText) || 750)) })
    }
    return (
      <div className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          {[
            { v: 'known', l: 'I know it' },
            { v: 'unknown', l: "I don't know" },
            { v: 'none', l: 'No history yet' },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => {
                if (o.v === 'known') setMode('known')
                else if (o.v === 'unknown') onAnswer({ creditScore: 'unknown' })
                else onAnswer({ creditScore: 'none' })
              }}
              className={`px-4 py-2.5 rounded-md border transition ${
                mode === o.v
                  ? 'bg-accent-soft border-[var(--accent)]'
                  : 'bg-app border-rule hover:border-[var(--accent)]'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
        {mode === 'known' && (
          <div>
            <div className="flex items-center gap-2 max-w-[12rem]">
              <input
                ref={mainRef}
                type="text"
                inputMode="numeric"
                value={scoreText}
                onChange={(e) => setScoreText(e.target.value.replace(/[^\d]/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter' && scoreValid) submitScore() }}
                className={inputClass}
                placeholder="750"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted mt-1">CIBIL scores range 300–900. Type your score, then press Enter.</p>
            <NextButton onClick={submitScore} disabled={!scoreValid} />
          </div>
        )}
      </div>
    )
  }

  // range: two grouped money inputs + Next
  if (f === 'range') {
    const rangeValid = hasLow && hasHigh
    const submitRange = () => {
      if (!rangeValid) return
      onAnswer({
        incomeLow: parseGrouped(lowRef.current?.value ?? ''),
        incomeHigh: parseGrouped(highRef.current?.value ?? ''),
      })
    }
    return (
      <div className="max-w-md">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Low month (₹)</span>
            <GroupedInput
              refEl={lowRef}
              isMoney
              placeholder="40,000"
              autoFocus
              initial={input.incomeLow ? groupIndian(String(input.incomeLow)) : ''}
              onChange={(_raw, num) => setHasLow(num > 0 || _raw === '0')}
              onKeyDown={(e) => { if (e.key === 'Enter' && rangeValid) submitRange() }}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">High month (₹)</span>
            <GroupedInput
              refEl={highRef}
              isMoney
              placeholder="80,000"
              initial={input.incomeHigh ? groupIndian(String(input.incomeHigh)) : ''}
              onChange={(_raw, num) => setHasHigh(num > 0 || _raw === '0')}
              onKeyDown={(e) => { if (e.key === 'Enter' && rangeValid) submitRange() }}
            />
          </label>
        </div>
        <NextButton onClick={submitRange} disabled={!rangeValid} />
      </div>
    )
  }

  // number / money
  const isMoney = f === 'money'
  const cur = (input as unknown as Record<string, unknown>)[question.writes[0] as string] as number | undefined
  const submit = () => {
    if (!hasMain) return
    onAnswer({ [question.writes[0]]: parseGrouped(mainRef.current?.value ?? '') } as Partial<BorrowerInput>)
  }
  return (
    <div className="max-w-md">
      <GroupedInput
        refEl={mainRef}
        isMoney={isMoney}
        placeholder={question.placeholder ?? ''}
        autoFocus
        initial={cur ? groupIndian(String(cur)) : ''}
        onChange={(_raw) => setHasMain(_raw.length > 0)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hasMain) submit() }}
      />
      <NextButton onClick={submit} disabled={!hasMain} />
    </div>
  )
}
