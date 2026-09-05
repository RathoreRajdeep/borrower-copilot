# Borrower Copilot

A borrower's self-assessment before they walk into a lender. No login, no bureau pull, nothing
stored. The borrower answers questions and gets four honest answers — **should I borrow, how
much, what rate, what EMI** — plus a one-page **Negotiation Card** to hold up to a lender.

Built for the Lokta build challenge. Stack: **React + Vite + TypeScript + Tailwind**. The entire
rule engine is pure functions in `src/rules/` with no ML and no network calls at runtime.

---

## Run it (under 5 minutes)

Needs Node 18+ (built and verified on Node 20).

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173).

Other scripts:

```bash
npm run build      # type-check + production build → dist/
npm run typecheck  # tsc --noEmit
npm run preview    # serve the built dist/
```

To reproduce the three borrowers in the brief, open the app and click **Priya / Ravi / Anita** on
the intro screen — each loads a full profile and jumps to the results.

To inspect the exact numbers the engine produces for all three, run:

```bash
npx tsx scripts/check-personas.ts
```

---

## What's where

```
src/
  rules/                 ← the engine. read alongside RULES.md
    affordability.ts       effective income, safe surplus, FOIR, EMI ceilings
    products.ts            loan product catalogue (rate bands, tenures, fees, LTV)
    credit.ts              score bands, rate adjustments
    emi.ts                 EMI / principal / all-in APR math
    fairRate.ts          O3  fair rate band + APR
    maxAmount.ts         O2  lender sanction vs borrower-safe amount
    emiCeiling.ts        O4  EMI ceiling, tenure trade-off, stress case
    borrowVerdict.ts     O1  borrow / borrow less / don't borrow
    index.ts              assess() — orchestrates the four outputs + the Card
  questions/
    schema.ts            the question set + adaptive applies() predicates
  data/
    personas.ts          Priya, Ravi, Anita — exact inputs for the run-throughs
  components/            UI: intro, adaptive question flow, results, card
  lib/format.ts          Indian number formatting
RULES.md                 every threshold, band and assumption (what · value · why · source)
RUNTHROUGHS.md           Priya, Ravi, Anita: questions asked, four outputs, the Card
```

Rules are **separated from UI** by construction: `assess(input)` is a pure function and the
components only render its output. Changing a rule means editing one constant in `src/rules/` and
the app updates live under Vite HMR.

---

## How it answers the brief

- **Two numbers, clearly different.** O2 shows what a lender will sanction vs what the borrower can
  safely carry, and says to use the smaller.
- **"Don't borrow" is reachable.** It fires for Anita (negative surplus, recent bounce, app-loan
  trap) and routes her to refinance first.
- **Ravi is routed to a secured product** (Loan Against Property) and told to borrow less, because
  his documented income can't safely carry ₹15L even though the property can.
- **APR is honest** — all-in cost includes the processing fee and 18% GST, solved properly.
- **Confidence widens with silence** — skipped questions keep bands wide and the app says so.
- **Unknown ≠ zero** — an unknown credit score is modelled as unknown with a small caution, never 300.
- **Every number has a why** — each output carries a one-sentence reason tracing it to the inputs.

See `RULES.md` for the full reasoning and `RUNTHROUGHS.md` for the three borrowers end-to-end.

---

## Walkthrough — what I'd build next, and what I'd cut

**What I'd build next**
- **Real product-tenure matrices per lender** so the fair band is a live pull from 3–4 named banks
  rather than a mid-2026 judgement snapshot, with a "cheapest fair lender" suggestion.
- **A refinance mode**: today the app *suggests* refinancing Anita's 30%+ app loans; the next step is
  a screen that actually computes the consolidated EMI and the interest saved, so "don't borrow"
  comes with a positive plan, not just a stop sign.
- **Co-applicant as a real second profile** (own income, expenses, score) instead of a single field —
  it materially changes Ravi's safe number and deserves first-class input.
- **A printable / shareable KFS-style Card** (PDF) that mirrors a lender's Key Facts Statement, so
  the borrower compares like-for-like in the branch.
- **Sensitivity sliders** on income and tenure on the results screen, so the borrower can feel the
  stress case themselves instead of only reading it.

**What I'd cut**
- **More loan products.** Home/car/two-wheeler/gold/LAP/personal/business already covers the three
  borrowers; adding education/consumer-durable loans would spread the rules thin without moving the
  scored personas.
- **A "score estimator."** Tempting, but it would be a guess presented as knowledge — the opposite of
  the "unknown is never zero" principle. Better to leave score unknown and widen the band.
- **Elaborate animations / multi-step flourishes.** They'd slow the first run and the eval is on
  reasoning and craft, not motion.

**The one rule I'd change first if asked live:** the FOIR ceiling (§3). It's the single knob that
moves both the lender sanction and (indirectly, via the binding ceiling) the safe amount. Bumping
salaried FOIR from 55% to 50% would visibly shrink Priya's lender number — a clean live demo that the
rules are separated from the UI and editable in seconds.
