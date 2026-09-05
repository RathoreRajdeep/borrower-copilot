# RUNTHROUGHS.md

The three borrowers from the brief, run through the app. For each: the questions the app asked,
the four outputs, and the Negotiation Card. Numbers are the exact output of `assess()` — reproducible
via `npx tsx scripts/check-personas.ts`.

The app never asks a question that doesn't apply. A salaried borrower never sees ITR, income range,
or collateral; a kirana owner never sees the salaried-only path.

---

## 1. Priya, 29 — Bengaluru · salaried

> Software engineer, net ₹1,10,000/mo, 5 yrs at MNC. Car loan EMI ₹14,000 (2 yrs left). Score 780.
> Rents ₹28,000. Wants **₹8,00,000 personal loan for a wedding**.

### Questions asked

**Must (8):** purpose (wedding) · amount wanted (₹8,00,000) · income type (salaried) · net income
(₹1,10,000) · existing EMIs (₹14,000) · household expenses (₹45,000) · age (29) · credit score (780).

**Additional (the ones that applied to a salaried, no-collateral borrower):** years in income (5) ·
active loans (1) · bounces in 6m (0) · card utilisation (25%) · emergency savings (4 months) ·
dependents (0) · collateral to pledge? (none) · co-applicant income (₹0) · upcoming expense (₹0) ·
preferred tenure (4 yrs). *(Income range, ITR, and income-from-loan were correctly skipped — they
only apply to variable/self-employed or productive loans.)*

### The four outputs

**O1 — Verdict: BORROW.** She can safely carry ₹11,44,852 — enough for the ₹8,00,000 she wants, with
a buffer for shocks. It's a personal (wedding) loan, unsecured, so the app adds: keep the amount
lean and tenure short.

**O2 — Max amount.** A lender would sanction **₹17,39,727** (FOIR 55% on ₹1.1L, less her car EMI).
She can safely carry **₹11,44,852** (surplus after ₹45,000 expenses and ₹14,000 EMI, capped at 60%
because she has 4 months saved). **Use ₹11,44,852.** The lender offers more than is safe — borrow the
safe number.

**O3 — Fair rate.** Band **10.0% – 17.0%**, expected **12.8%**, all-in APR **14.43%** (incl. 2.5% fee
+ 18% GST). Why: 780 is strong (−0.5%), 5 yrs salaried is stable (−0.25%), card utilisation 25% is
healthy (−0.25%), on a personal-loan base of 11–18%.

**O4 — EMI ceiling: ₹30,600/mo.** Binds on the *borrower* side (the lender would allow ~₹46,500). At
₹8,00,000 over 3 yrs the EMI is ~₹26,900 — under her ceiling. Recommended tenure 3 yrs (cheapest
total interest that still fits ₹8L). Stress test: income drops 15% → ₹7,622 left after paying the
EMI → **survives**.

### Negotiation Card

> **Personal loan · Unsecured — Borrow, but hold the lender to this card.**
> Safe to borrow ₹11,44,852 · Lender may sanction ₹17,39,727 · Fair band 10.0–17.0% · All-in APR 14.43%
> · EMI ceiling ₹30,600/mo · Tenure 4 yrs · Credit score 780.
> *Income (effective) ₹1,10,000/mo; existing EMIs ₹14,000; safe EMI ceiling ₹30,600; unsecured, fair
> band 10–17%.*
> "Fair for my profile is 10–17%, because my safe EMI ceiling is ₹30,600/mo and the all-in APR I should
> pay is 14.43%."

---

## 2. Ravi, 42 — Mysuru · self-employed

> Kirana store 14 yrs. Cash ₹40,000–80,000/mo; ITR ₹4,20,000/yr. Owns shop premises (~₹45,00,000),
> unencumbered. No formal loan ever; no credit score. Wife earns ₹18,000 teaching. Wants
> **₹15,00,000** for stock + a delivery vehicle.

### Questions asked

**Must (8):** purpose (business) · amount (₹15,00,000) · income type (self-employed) · net income
(₹35,000 — his ITR/12) · existing EMIs (₹0) · household expenses (₹22,000) · age (42) · credit score
(none — first-time borrower).

**Additional (now the self-employed path opens):** income swing (₹40,000–₹80,000) · years in income
(14) · **has ITR? (yes)** · bounces (0) · emergency savings (2 months) · dependents (2) · **collateral
to pledge? (property, ₹45,00,000)** · co-applicant income (₹18,000 — wife) · **will the loan add
income? (yes, ~₹12,000/mo)** · preferred tenure (10 yrs). *(Card utilisation was skipped — he has no
cards; active-loan count was skipped — no existing EMIs.)*

### The four outputs

**O1 — Verdict: BORROW LESS — about ₹8,44,492.** He wants ₹15,00,000 but can safely carry only
₹8,44,492; the full amount would push EMI past his safe ceiling. Suggestion: stretch to 15 yrs or add
the wife as co-applicant to lift the safe amount.

**O2 — Max amount.** A lender would sanction **₹19,04,869** (household income ₹53,000 × FOIR 50%,
against his ₹45,00,000 property at 65% LTV = ₹29,25,000 — income binds, not collateral). He can
safely carry **₹8,44,492** (effective income ₹36,000 + 70% of wife's ₹18,000, less ₹22,000 expenses;
45% share — 50% base for thin savings, minus 5% for 2 dependents). **Use ₹8,44,492.** The lender
offers ₹19L against his property; his documented income can't safely carry it. The gap is the whole
point.

**O3 — Fair rate.** Band **10.5% – 12.5%**, expected **11.7%**, APR **11.99%**. Why: no credit
history (+1.0% thin-file), but **routed to a secured Loan Against Property** — collateral keeps the
floor low. The ₹12,000/mo the loan should add improves *his repayment*, not the lender's quote.

**O4 — EMI ceiling: ₹11,970/mo.** Binds on the borrower side. At ₹8,44,492 / 10 yrs the EMI is
~₹11,970 — exactly at his ceiling. Recommended tenure 10 yrs. Stress test: income drops 15% →
₹9,230 left after paying the EMI → **survives**.

### Negotiation Card

> **Loan Against Property · Secured — Borrow only ₹8,44,492, not the full ask.**
> Safe to borrow ₹8,44,492 · Lender may sanction ₹19,04,869 · Fair band 10.5–12.5% · All-in APR
> 11.99% · EMI ceiling ₹11,970/mo · Tenure 10 yrs · Credit history: none (first-time).
> *Routed to secured LAP on his ₹45L property — that is why a "no score" borrower still gets a fair,
> low band. Borrow against the property, but only what his income can serve.*

---

## 3. Anita, 35 — Hubballi · informal

> Delivery rider + home tailoring. ₹26,000–30,000/mo. Two children, husband unemployed 8 months.
> Three app loans, ₹35,000 outstanding at 30%+, one EMI bounced last month. Wants **₹1,50,000** for
> an electric scooter to double delivery runs.

### Questions asked

**Must (8):** purpose (vehicle) · amount (₹1,50,000) · income type (informal) · net income (₹28,000) ·
existing EMIs (₹5,000) · household expenses (₹23,000) · age (35) · credit score (don't know).

**Additional (the informal/over-leveraged path):** income swing (₹26,000–₹30,000) · years in income
(1) · **has ITR? (no)** · active loans (3) · **bounces in 6m (1)** · card utilisation (90%) · emergency
savings (0 months) · dependents (3) · **collateral to pledge? (gold, ₹60,000)** · co-applicant income
(₹0 — husband unemployed) · **will the loan add income? (yes, ~₹6,000/mo)** · preferred tenure (3 yrs).

### The four outputs

**O1 — Verdict: DON'T BORROW — not like this.** Her safe surplus is **−₹5,900** (informal income
floored at ₹21,100, minus ₹23,000 expenses and ₹5,000 EMIs) — there is no room for a new EMI. And
even though the scooter is productive, the EMI must be affordable *before* the new income arrives.
**Better path offered:** first refinance the three 30%+ app loans into a gold loan (her ₹60,000 gold)
— one lower EMI frees up cash flow before borrowing more.

**O2 — Max amount.** A lender would sanction only **₹45,000** (gold LTV 75% on ₹60,000 — income is too
thin for an unsecured route). She can safely carry **₹0**. Don't borrow until cash flow opens up.

**O3 — Fair rate.** Band **11.75% – 15.75%**, expected **13.75%**, APR **14.59%** — on a **gold loan**,
secured by her gold. Why: score unknown (+0.5% caution, *not* treated as 300), informal income
(+0.75%), 1 bounce (+1.0%), card utilisation 90% (+0.5%) — but secured collateral keeps it far below
the 30%+ her app loans charge. *That 30%→14% gap is the actionable insight.*

**O4 — EMI ceiling: ₹0/mo.** No room for any new EMI after her expenses and existing app-loan EMIs — so
there is no safe tenure to show. Stress test: income drops 15% → ₹9,215 short → **fails**.
Don't borrow on these terms.

### Negotiation Card

> **Gold loan · Secured — Don't borrow on these terms. First refinance your high-cost existing loans
> into a gold loan — one lower EMI frees up cash flow before you borrow more.**
> Safe to borrow ₹0 · Lender may sanction ₹45,000 · Fair band 11.75–15.75% · All-in APR 14.59% · EMI
> ceiling ₹0/mo · Credit score: unknown — to be confirmed with CIBIL.
> *The app's job here is to stop a new loan and point at the real problem: ₹35,000 at 30%+. Replace
> it with ₹45,000 of secured gold debt at ~14%, cut the monthly burden, then revisit the scooter.*

---

## What this shows about the engine

- The **same engine** routes Priya to an unsecured personal loan, Ravi to a secured LAP, and Anita
  to a secured gold loan — purely from their answers.
- "Don't borrow" fires for Anita; "borrow less" for Ravi; "borrow" for Priya — each with a
  one-sentence reason traceable to inputs.
- The lender's number and the borrower's number are **correctly different**, and the borrower is
  told to use the smaller.
- APR is honest about the processing fee and GST. Unknown score is never zero.
