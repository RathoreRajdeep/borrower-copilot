import { useState } from 'react'
import type { BorrowerInput } from '../types'
import { pendingQuestions, QUESTIONS } from '../questions/schema'
import QuestionField from './QuestionField'

interface Props {
  input: BorrowerInput
  setInput: (updater: (prev: BorrowerInput) => BorrowerInput) => void
  answered: number
  total: number
  allDone: boolean
  onFinish: () => void
  onBack: () => void
}

interface HistoryEntry {
  id: string
  writes: (keyof BorrowerInput)[]
  skipped: boolean
}

export default function QuestionFlow({
  input,
  setInput,
  answered,
  total,
  onFinish,
  onBack,
}: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [skipped, setSkipped] = useState<Set<string>>(new Set())

  const pending = pendingQuestions(input).filter((q) => !skipped.has(q.id))
  const current = pending[0]
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0

  function applyAnswer(writes: Partial<BorrowerInput>, qid: string, writesKeys: (keyof BorrowerInput)[]) {
    setInput((prev) => ({ ...prev, ...writes }))
    setHistory((h) => [...h, { id: qid, writes: writesKeys, skipped: false }])
  }

  function skip(qid: string, writesKeys: (keyof BorrowerInput)[]) {
    setSkipped((s) => new Set(s).add(qid))
    setHistory((h) => [...h, { id: qid, writes: writesKeys, skipped: true }])
  }

  function back() {
    if (history.length === 0) {
      onBack()
      return
    }
    const last = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setSkipped((s) => {
      const n = new Set(s)
      n.delete(last.id)
      return n
    })
    if (!last.skipped) {
      setInput((prev) => {
        const next = { ...prev }
        for (const k of last.writes) (next as Record<string, unknown>)[k as string] = undefined
        return next
      })
    }
  }

  const allDoneNow = pending.length === 0

  return (
    <div className="bg-app min-h-screen">
      <div className="mx-auto max-w-2xl px-5 pb-20">
        <div className="pt-6 sticky top-0 bg-app z-10 pb-4 border-b border-rule">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <button onClick={back} className="hover:text-ink transition">
              ← {history.length === 0 ? 'Home' : 'Back'}
            </button>
            <span className="font-mono">
              {answered}/{total} answered
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-soft overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {allDoneNow ? (
          <div className="mt-16 text-center">
            <h2 className="font-display text-3xl">You're set.</h2>
            <p className="text-muted mt-3 max-w-md mx-auto">
              That's everything we need. Anything you skipped stays unknown — the app will run with
              wider bands and lower confidence, and it will say so.
            </p>
            <button
              onClick={onFinish}
              className="bg-accent text-on-accent font-semibold px-6 py-3 rounded-md text-lg mt-6 hover:opacity-90 transition"
            >
              Show me my four answers →
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-xs font-semibold tracking-widest uppercase text-muted">
              {current.tier === 'must' ? 'Needed' : 'Helps tighten the numbers'}
            </div>
            <h2 className="font-display text-2xl mt-1 leading-tight">{current.label}</h2>
            <p className="text-sm text-muted mt-2 max-w-xl">{current.help}</p>
            <p className="text-xs text-muted mt-2 italic">Moves: {current.moves}</p>

            <div className="mt-5">
              <QuestionField
                key={current.id}
                question={current}
                input={input}
                onAnswer={(writes) => applyAnswer(writes, current.id, current.writes)}
              />
            </div>

            {current.skippable && current.tier === 'additional' && (
              <button
                onClick={() => skip(current.id, current.writes)}
                className="mt-5 text-sm text-muted underline hover:text-ink transition"
              >
                Skip — I don't know
              </button>
            )}
          </div>
        )}

        {history.filter((h) => !h.skipped).length > 0 && (
          <details className="mt-12 border-t border-rule pt-4">
            <summary className="text-xs font-semibold tracking-widest uppercase text-muted cursor-pointer">
              What you've told us ({history.filter((h) => !h.skipped).length})
            </summary>
            <ul className="mt-3 space-y-1.5 text-sm">
              {QUESTIONS.filter((q) => history.some((h) => h.id === q.id && !h.skipped)).map((q) => (
                <li key={q.id} className="text-muted">
                  <span className="text-ink">{q.label}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  )
}
