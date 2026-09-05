import { PERSONAS } from '../data/personas'

interface Props {
  onStart: () => void
  onPersona: (id: string) => void
}

export default function Intro({ onStart, onPersona }: Props) {
  return (
    <div className="bg-app min-h-screen">
      <div className="mx-auto max-w-3xl px-5 pb-16">
        <header className="pt-14 pb-8 border-b border-rule">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted">
            Borrower Copilot
          </p>
          <h1 className="font-display font-medium mt-3 text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Walk into the lender as the <em className="text-accent italic">best-informed</em> person in the room.
          </h1>
          <p className="font-display mt-4 text-lg leading-snug max-w-2xl">
            Answer a few questions. Get four honest answers before you borrow:{' '}
            <span className="text-accent font-semibold">should I borrow, how much, what rate, what EMI</span>
            {' '}— plus a one-page card to negotiate with.
          </p>
          <p className="mt-3 text-sm text-muted max-w-xl">
            No login. No bureau pull. Nothing stored. Everything runs from what you tell us.
          </p>
        </header>

        <section className="mt-8">
          <button
            onClick={onStart}
            className="bg-accent text-on-accent font-semibold px-6 py-3 rounded-md text-lg hover:opacity-90 transition"
          >
            Start my assessment →
          </button>
        </section>

        <section className="mt-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
            Or try one of the three borrowers we built this for
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => onPersona(p.id)}
                className="text-left bg-soft border border-rule rounded-lg p-4 hover:border-[var(--accent)] transition flex flex-col"
              >
                <div className="font-display text-xl font-medium leading-tight">{p.who}</div>
                <div className="text-xs uppercase tracking-wide text-muted mt-0.5">{p.where}</div>
                <p className="text-sm mt-2 flex-1">{p.blurb}</p>
                <p className="text-sm mt-3 pt-3 border-t border-rule">
                  <b className="text-accent">{p.ask}</b>
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">
            These load a full profile and jump straight to the results — each shows the questions asked and the Negotiation Card.
          </p>
        </section>

        <footer className="mt-16 pt-6 border-t border-rule font-display italic text-muted">
          Every number the app gives you has a one-sentence why — so you can argue it in the branch, not just accept it.
        </footer>
      </div>
    </div>
  )
}
