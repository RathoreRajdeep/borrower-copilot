# RULES.md

Every threshold, band and assumption the app uses. Each row: **what · value · why · source**.
Where a number is my judgement rather than a published figure, the source column says so plainly.
The code lives in `src/rules/` and mirrors this table one-to-one; changing a value here means changing it there.

> The app is a **self-assessment**, not a credit model. It gives the borrower the same kind of
> guardrails a lender uses, but oriented to the *borrower's* safety. It never narrows a range it has
> no basis to narrow, and "I don't know" is never treated as zero.

---

## 1. Income — what we plan on

Lenders plan on the best month; a careful borrower plans on the worst. We compute an **effective
income** and use it for the borrower's safe ceiling. The lender's sanction uses household income
(see §4).

| What | Value | Why | Source |
|---|---|---|---|
| Salaried effective income | stated net monthly | Fixed pay is predictable. | definition |
| Self-employed effective income | `max(ITR/12, cash-low) × 0.90` | Lenders sanction on documented income; we haircut the floor for swings. | RBI self-employed underwriting norms + my judgement (0.90) |
| Informal / gig effective income | `cash-low × 0.85` | Gig income is the most volatile; plan on 85% of the worst month. | my judgement |
| Co-applicant contribution to *safe* surplus | `co-applicant income × 0.70` | A spouse's income is real household money but not under the borrower's control; count 70%. | my judgement |
| Co-applicant contribution to *lender* sanction | 100% | Lenders add co-applicant income fully to household FOIR. | standard bank practice |

---

## 2. Affordability — the borrower's safe ceiling

| What | Value | Why | Source |
|---|---|---|---|
| Safe surplus | `effectiveIncome + 0.70×coApp − householdExpenses − existingEMIs − (upcomingExpense/12)` | The only honest pool a new EMI can come from. | definition |
| EMI share of surplus, ≥3 months savings | 60% | 3+ months saved → keep a 40% shock buffer. | my judgement |
| EMI share of surplus, 1–3 months savings | 50% | keep a 50% buffer. | my judgement |
| EMI share of surplus, <1 month savings | 35% | thin savings → keep a 65% buffer; fragile. | my judgement |
| Dependents adjustment | −5pts per dependent above 1 (floor 30%) | more mouths on the same income → hold more back. | my judgement |
| Safe EMI ceiling | `safeSurplus × share` | the monthly outflow the borrower should not cross. | definition |

---

## 3. Lender's sanction — what a bank will likely approve

| What | Value | Why | Source |
|---|---|---|---|
| FOIR ceiling, salaried | 55% | Large-bank salaried cap. | SBI/HDFC/ICICI personal-loan FOIR guidance (~50–55%) + my judgement (top of band) |
| FOIR ceiling, self-employed | 50% | Self-employed capped tighter. | bank practice + my judgement |
| FOIR ceiling, informal | 45% | Informal income → lowest sanction headroom. | my judgement |
| Lender EMI cap | `householdIncome × FOIR − existingEMIs` | the lender's guardrail. | definition |
| LTV, home loan | 80% | RBI/regulatory cap for home loans. | RBI LTV norms |
| LTV, Loan Against Property | 65% | LAP LTV band. | HDFC/Bajaj LAP rate sheets + my judgement |
| LTV, gold loan | 75% | RBI gold-loan LTV ceiling. | RBI gold loan directions |
| LTV, two-wheeler | 90% | high LTV allowed on the vehicle itself. | NBFC two-wheeler sheets + my judgement |
| LTV, business (secured) | 65% | secured business against property. | my judgement |
| Sanction amount | `min(EMI→principal at fair rate, LTV cap)` for secured; EMI→principal for unsecured | the lender will give the smaller of income-based and collateral-based. | definition |

> **The two numbers are deliberately different.** O2 shows lender sanction vs borrower-safe and
> tells the borrower to use the *smaller*. The gap *is* the product.

---

## 4. Fair interest rate band (O3)

Base bands are Indian market mid-2026 ranges. We then nudge the band by the borrower's risk profile.

### 4a. Product base bands (% p.a.)

| Product | Rate band | Tenure | Processing fee | Source |
|---|---|---|---|---|
| Home loan | 8.4 – 9.6% | 10–30y | 0.5% | SBI/HDFC/ICICI rate sheets |
| Loan Against Property | 9.5 – 11.5% | 5–15y | 1.0% | HDFC/Bajaj LAP sheets + my judgement |
| Personal loan | 11.0 – 18.0% | 1–6y | 2.5% | large-bank personal-loan rate cards |
| Personal (wedding) | 11.0 – 18.0% | 1–5y | 2.5% | treated as personal; consumption flagged in verdict |
| Business (secured) | 10.5 – 14.0% | 3–7y | 1.5% | bank/NBFC MSME secured loans + my judgement |
| Gold loan | 9.0 – 13.0% | 0.5–4y | 1.0% | Muthoot/Manappuram rate cards |
| Two-wheeler | 9.5 – 14.0% | 1–4y | 2.0% | NBFC two-wheeler sheets + my judgement |
| Car loan | 9.0 – 12.0% | 3–7y | 1.5% | bank auto-loan rate cards |

### 4b. Risk adjustments to the band (percentage points)

| Driver | Adjustment | Why | Source |
|---|---|---|---|
| Score 800+ | −1.0% | top-tier | credit-risk pricing convention |
| Score 750–799 | −0.5% | strong | convention |
| Score 700–749 | 0 | market average | convention |
| Score 650–699 | +0.5% | below average | convention |
| Score 600–649 | +1.5% | weak | convention |
| Score <600 | +3.0% | high-risk | convention |
| Score **unknown** | +0.5% | model as unknown, *not* 300; small caution. | brief rule 3 + my judgement |
| **No** credit history | +1.0% | thin-file premium | underwriting practice |
| Salaried 3+ yrs | −0.25% | stable employer | my judgement |
| Informal/gig income | +0.75% | volatile | my judgement |
| EMI bounce in 6m | +1.0% each | repayment red flag | underwriting practice |
| Card utilisation >75% | +0.5% | overextended | bureau-behaviour convention |
| Card utilisation <30% | −0.25% | healthy (has a card, low balance) | convention |
| Card utilisation unknown | 0 | no card or skipped — no adjustment, not a 0% discount | brief rule 3 |

### 4c. Expected ("fair") rate point within the band

The band is the truth; the expected rate is where *this* borrower should land.

| Score band | Position in band | Why |
|---|---|---|
| excellent (800+) | 30% up from low | expect the best end |
| good (750–799) | 40% | near the best end |
| fair (700–749) | 50% (mid) | market average |
| unknown | 50% (mid) | no basis to skew |
| average (650–699) / no history | 60% | slightly above mid |
| weak (600–649) | 75% | expect the worse end |
| poor (<600) | 85% | expect near the cap |

### 4d. All-in APR (RBI-style)

| What | Value | Why | Source |
|---|---|---|---|
| APR definition | rate where `(principal − fee) = Σ EMI/(1+r/12)^t` | all-in cost of money actually received. | RBI Key Facts Statement / APR convention |
| Fee GST | 18% on processing fee | GST is part of the all-in cost. | GST law |
| Solver | bisection, 80 iterations | robust, no derivative. | my judgement |

---

## 5. Verdict — borrow / borrow less / don't borrow (O1)

Evaluated in order; the first hard stop wins.

| Rule | Fires when | Verdict | Why |
|---|---|---|---|
| No surplus | `safeSurplus ≤ 0` | don't borrow | no room for any EMI |
| Already over-leveraged | `existing FOIR > 50%` **and** unsecured | don't borrow | adding unsecured debt compounds risk |
| Recent bounce + unsecured | `bounces ≥ 1` **and** unsecured | don't borrow | new unsecured borrowing deepens a cycle |
| Thin margin + stress fails | `!stressSurvives` **and** `surplus < 10% of income` | don't borrow | one bad month → default |
| Over-asking | `wanted > 1.1 × safeAmount` | borrow less | EMI would breach the safe ceiling |
| Otherwise | safe amount covers wanted | borrow | with honest caveats |

**Suggestions** appended to a "don't borrow": refinance high-cost existing loans into a secured loan
first (gold/LAP); add a co-applicant; check CIBIL. These are the better paths, not a green light.

> A productive loan (one that adds income) does **not** override affordability. The new income is
> not guaranteed; the EMI must be serviceable *before* it arrives.

---

## 6. EMI ceiling & stress (O4)

| What | Value | Why | Source |
|---|---|---|---|
| Binding EMI ceiling | `min(lenderEmiCap, safeEmiCeiling)` | the lower of the two guardrails. | definition |
| Tenure trade-off | same ceiling EMI → principal across product tenures | shows the amount/total-interest trade-off. | EMI formula |
| Recommended tenure | smallest tenure where the actual borrow amount fits the ceiling | cheapest total interest that still works. | my judgement |
| Stress — income shock | primary income −15%; co-applicant income unchanged | job/seasonal shock hits the borrower, not necessarily the spouse. | RBI repo-shock stress convention + my judgement |
| Stress — rate shock | rate +200bps on the actual borrow amount | repo shock on the committed EMI. | convention |
| Stress pass | remaining cash ≥ 0 **after paying the committed EMI** | survives if the EMI is still payable, not just if cash is positive. | definition |
| Stress uses actual amount | `min(wanted, safe)` not wanted | stress what they'll actually borrow, not what they asked for. | my judgement |

---

## 7. Confidence — widens with silence

| What | Value | Why | Source |
|---|---|---|---|
| Answered ≥14 (of applicable) | tight | enough signal. | my judgement |
| Answered 10–13 | medium | some guessing. | my judgement |
| Answered <10 | wide | band deliberately widened: `−0.75 / +1.5%` | brief rule 2 + my judgement |
| Medium | band widened `−0.25 / +0.5%` | less widening. | my judgement |

Every skipped additional question is left **unknown**, never defaulted to a number that would
falsely narrow a range. Defaults are only neutral zeros/none where a missing value must not move
the output (e.g. `collateralKind: none`, `hasITR: false`). Card utilisation and income range are
left undefined when skipped so they don't trigger a false discount or a false floor.

Confidence is computed from the **raw** answered count (before defaults fill in 0s), so skipping
questions actually widens the band — per brief rule 2.

---

## 8. Question design

8 **must** questions (always asked): purpose, amount wanted, income type, net income, existing
EMIs, household expenses, age, credit score (with "don't know" / "no history").

**Additional** questions each have an `applies()` predicate and are only shown when relevant:

| Question | Applies when | Moves |
|---|---|---|
| Income range (low/high) | not salaried | safe income floor, rate, confidence |
| Years in income | always (skippable) | rate |
| Has ITR | not salaried | sanction, rate |
| Active loan count | existing EMIs > 0 | rate, verdict |
| Bounces (6m) | existing EMIs > 0 | rate, verdict |
| Card utilisation | always (skippable) | rate |
| Emergency savings | always (skippable) | EMI share (buffer) |
| Dependents | always (skippable) | EMI share (buffer) |
| Collateral kind | business/property/personal/wedding/other, or not salaried | product routing, rate, LTV |
| Collateral value | collateral pledged, or home | LTV cap |
| Co-applicant income | always (skippable) | sanction, safe surplus |
| Income from loan | business / vehicle | verdict (productive flag) |
| Upcoming expense | always (skippable) | safe surplus |
| Tenure preference | always (skippable) | EMI, amount, interest |
| Offered rate | always (skippable) | comparison on the Card |

A salaried IT employee never sees ITR, income range, or collateral; a kirana owner never sees the
salaried-only path. If a question never moves a number, it is not in the list.

---

## 9. What we do NOT know (honesty about limits)

- **No bureau pull.** "Credit score" is whatever the borrower types. We cannot verify it.
- **No real lender policy.** FOIR limits and LTV are market conventions, not any one bank's
  underwriting. A specific lender may be tighter or looser.
- **Rate bands are snapshots.** Market rates move; the bands are mid-2026 judgement, not live.
- **Income is self-reported.** Informal/variable income especially — the floor is an assumption.
- **Productive-loan income is an estimate** the borrower gives us; we treat it as not-guaranteed.
- **Processing fees vary by lender** and are often negotiable; we use a product-typical fee.
- **APR ignores** prepayment penalties, late-payment charges, and insurance bundling — all real
  but too lender-specific to model honestly here.

If the app is guessing, it says so via the confidence badge and the widened band.
