import { useMemo, useState } from 'react'
import type { BorrowerInput } from './types'
import { PERSONAS } from './data/personas'
import { assess } from './rules'
import { pendingQuestions, answeredCount, QUESTIONS } from './questions/schema'
import Intro from './components/Intro'
import QuestionFlow from './components/QuestionFlow'
import Results from './components/Results'

type Phase = 'intro' | 'questions' | 'results'

const EMPTY: BorrowerInput = {} as BorrowerInput

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [input, setInput] = useState<BorrowerInput>(EMPTY)

  const assessment = useMemo(() => {
    if (phase !== 'results') return null
    return assess(input)
  }, [input, phase])

  const answered = useMemo(() => answeredCount(input), [input])
  const totalApplies = useMemo(
    () => QUESTIONS.filter((q) => q.applies(input)).length,
    [input],
  )

  function startEmpty() {
    setInput({} as BorrowerInput)
    setPhase('questions')
  }

  function loadPersona(id: string) {
    const p = PERSONAS.find((x) => x.id === id)
    if (!p) return
    setInput({ ...p.input })
    setPhase('results')
  }

  function reset() {
    setInput({} as BorrowerInput)
    setPhase('intro')
  }

  if (phase === 'intro') {
    return <Intro onStart={startEmpty} onPersona={loadPersona} />
  }

  if (phase === 'questions') {
    const pending = pendingQuestions(input)
    const done = pending.length === 0
    return (
      <QuestionFlow
        input={input}
        setInput={setInput}
        answered={answered}
        total={totalApplies}
        onFinish={() => setPhase('results')}
        onBack={() => setPhase('intro')}
        allDone={done}
      />
    )
  }

  return (
    <Results
      assessment={assessment!}
      input={input}
      onRestart={reset}
      onEdit={() => setPhase('questions')}
    />
  )
}
