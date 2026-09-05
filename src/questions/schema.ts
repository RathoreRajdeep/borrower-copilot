import type { BorrowerInput, IncomeType, LoanPurpose } from '../types'

// A question is a piece of UI that writes one (or two) input fields.
// `applies` decides whether it shows at all — this is the adaptivity.
// `moves` is the output(s) the answer changes. If a question never moves a
// number, it should not exist (brief, rule 2).
export type FieldType =
  | 'number'
  | 'money'
  | 'select'
  | 'score'
  | 'range' // low + high
  | 'boolean'

export interface Question {
  id: string
  tier: 'must' | 'additional'
  label: string
  help: string
  field: FieldType
  // which output(s) this answer can move
  moves: string
  options?: { value: string; label: string }[]
  // field(s) of BorrowerInput this writes
  writes: (keyof BorrowerInput)[]
  applies: (input: BorrowerInput) => boolean
  // can the borrower legitimately skip it? must-questions are never skippable.
  skippable?: boolean
  placeholder?: string
}

const PURPOSES: { value: string; label: string }[] = [
  { value: 'home', label: 'Buy / build a home' },
  { value: 'property', label: 'Loan against property I own' },
  { value: 'personal', label: 'Personal need (medical, etc.)' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'vehicle', label: 'Vehicle (car / scooter)' },
  { value: 'business', label: 'Business (stock, equipment, vehicle)' },
  { value: 'gold', label: 'Gold loan' },
  { value: 'other', label: 'Something else' },
]

const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: 'salaried', label: 'Salaried (fixed pay)' },
  { value: 'self-employed', label: 'Self-employed (business / shop / freelance)' },
  { value: 'informal', label: 'Informal / gig (daily wage, platform, tailoring)' },
]

const COLLATERAL: { value: string; label: string }[] = [
  { value: 'none', label: 'No, nothing to pledge' },
  { value: 'property', label: 'Yes — property' },
  { value: 'gold', label: 'Yes — gold' },
  { value: 'vehicle', label: 'Yes — a vehicle' },
]

const TENURE_OPTS: { value: string; label: string }[] = [
  { value: '1', label: 'Short (1-2 yrs)' },
  { value: '3', label: '3 yrs' },
  { value: '5', label: '5 yrs' },
  { value: '7', label: '7 yrs' },
  { value: '10', label: '10 yrs' },
  { value: '15', label: 'Long (15 yrs)' },
]

export const QUESTIONS: Question[] = [
  // ---------- MUST (8) ----------
  {
    id: 'purpose',
    tier: 'must',
    label: 'What is the loan for?',
    help: 'This picks the product — home, personal, gold, business — which sets the rate band, tenure and whether collateral helps.',
    field: 'select',
    options: PURPOSES,
    writes: ['purpose'],
    moves: 'rate band · tenure · product routing',
    applies: () => true,
  },
  {
    id: 'amountWanted',
    tier: 'must',
    label: 'How much do you want to borrow?',
    help: 'We compare this against what you can safely carry. Asking for more than you can carry → "borrow less".',
    field: 'money',
    writes: ['amountWanted'],
    moves: 'verdict · max amount · EMI',
    applies: () => true,
    placeholder: '8,00,000',
  },
  {
    id: 'incomeType',
    tier: 'must',
    label: 'How do you earn?',
    help: 'Salaried, self-employed and informal incomes are priced and stressed very differently by lenders — and by this app.',
    field: 'select',
    options: INCOME_TYPES,
    writes: ['incomeType'],
    moves: 'rate · FOIR limit · safe income',
    applies: () => true,
  },
  {
    id: 'incomeStated',
    tier: 'must',
    label: 'Your net monthly income (typical month)',
    help: 'Take-home after tax. For variable income, give your usual month — we will ask about the spread next.',
    field: 'money',
    writes: ['incomeStated'],
    moves: 'safe amount · EMI ceiling',
    applies: () => true,
    placeholder: '1,10,000',
  },
  {
    id: 'existingEMIs',
    tier: 'must',
    label: 'Total of EMIs you already pay each month',
    help: 'All loans, credit-card EMIs, app loans. This is existing FOIR — the first thing a lender and your wallet check.',
    field: 'money',
    writes: ['existingEMIs'],
    moves: 'verdict · max amount · EMI ceiling',
    applies: () => true,
    placeholder: '14,000',
  },
  {
    id: 'householdExpenses',
    tier: 'must',
    label: 'Monthly household expenses (rent, food, bills, school)',
    help: 'Your real living cost. Income minus this minus EMIs is your safe surplus — the only honest pool for a new EMI.',
    field: 'money',
    writes: ['householdExpenses'],
    moves: 'safe amount · EMI ceiling · verdict',
    applies: () => true,
    placeholder: '45,000',
  },
  {
    id: 'age',
    tier: 'must',
    label: 'Your age',
    help: 'Long tenures end before retirement; lenders cap tenure to age 60-70. Affects how long you can stretch.',
    field: 'number',
    writes: ['age'],
    moves: 'max tenure · amount',
    applies: () => true,
    placeholder: '29',
  },
  {
    id: 'creditScore',
    tier: 'must',
    label: 'Your credit score (CIBIL)?',
    help: '"Don\'t know" is a real answer — we model it as unknown, not as 300, and price a small caution. Never zero.',
    field: 'score',
    writes: ['creditScore'],
    moves: 'rate band · verdict',
    applies: () => true,
  },

  // ---------- ADDITIONAL (each one moves a number) ----------
  {
    id: 'incomeRange',
    tier: 'additional',
    label: 'How much does your income swing in a month?',
    help: 'Variable income is stressed at its floor, not its average. A wide swing widens your safe band and lowers the rate you should expect.',
    field: 'range',
    writes: ['incomeLow', 'incomeHigh'],
    moves: 'safe income (floor) · rate · confidence',
    applies: (i) => i.incomeType !== 'salaried',
    skippable: true,
  },
  {
    id: 'yearsInIncome',
    tier: 'additional',
    label: 'How long in your current income source?',
    help: 'Stable income (3+ years) earns a small rate discount; new income is treated cautiously.',
    field: 'number',
    writes: ['yearsInIncome'],
    moves: 'rate',
    applies: () => true,
    skippable: true,
    placeholder: '5',
  },
  {
    id: 'hasITR',
    tier: 'additional',
    label: 'Do you have ITR / bank statements for 2 years?',
    help: 'Documented income is what a lender sanctions a self-employed borrower on. No docs → smaller sanction, higher rate.',
    field: 'boolean',
    writes: ['hasITR'],
    moves: 'sanction amount · rate',
    applies: (i) => i.incomeType !== 'salaried',
    skippable: true,
  },
  {
    id: 'activeLoanCount',
    tier: 'additional',
    label: 'How many active loans do you have right now?',
    help: 'Many small loans (esp. app loans) signal over-leverage even if the EMI total looks modest.',
    field: 'number',
    writes: ['activeLoanCount'],
    moves: 'rate · verdict',
    applies: (i) => (i.existingEMIs ?? 0) > 0,
    skippable: true,
    placeholder: '1',
  },
  {
    id: 'bouncesLast6m',
    tier: 'additional',
    label: 'Any EMI bounced / missed in the last 6 months?',
    help: 'A recent bounce is a strong "don\'t add unsecured debt" signal and raises your rate band.',
    field: 'number',
    writes: ['bouncesLast6m'],
    moves: 'rate · verdict',
    applies: (i) => (i.existingEMIs ?? 0) > 0,
    skippable: true,
    placeholder: '0',
  },
  {
    id: 'cardUtilisationPct',
    tier: 'additional',
    label: 'Credit card outstanding as % of your total limit',
    help: 'Over 75% utilisation reads as overextended and nudges the rate up; under 30% helps.',
    field: 'number',
    writes: ['cardUtilisationPct'],
    moves: 'rate',
    applies: () => true,
    skippable: true,
    placeholder: '40',
  },
  {
    id: 'emergencySavingsMonths',
    tier: 'additional',
    label: 'Emergency savings — how many months of expenses?',
    help: 'Thin savings mean we keep a bigger buffer, so your safe EMI ceiling is lower. More savings → you can commit more of your surplus.',
    field: 'number',
    writes: ['emergencySavingsMonths'],
    moves: 'EMI ceiling (safe share)',
    applies: () => true,
    skippable: true,
    placeholder: '3',
  },
  {
    id: 'dependents',
    tier: 'additional',
    label: 'How many dependents?',
    help: 'More dependents → we hold back a little more of your surplus as buffer.',
    field: 'number',
    writes: ['dependents'],
    moves: 'EMI ceiling (buffer)',
    applies: () => true,
    skippable: true,
    placeholder: '2',
  },
  {
    id: 'collateralKind',
    tier: 'additional',
    label: 'Do you own property or gold you could pledge?',
    help: 'Pledging collateral routes you to a secured product (LAP / gold) — cheaper, and can flip a "don\'t borrow" to "borrow".',
    field: 'select',
    options: COLLATERAL,
    writes: ['collateralKind'],
    moves: 'product routing · rate · LTV cap',
    applies: (i) =>
      ['business', 'property', 'personal', 'wedding', 'other'].includes(i.purpose ?? '') ||
      i.incomeType !== 'salaried',
    skippable: true,
  },
  {
    id: 'collateralValue',
    tier: 'additional',
    label: 'Approx. value of that property / gold',
    help: 'Sets the LTV cap — the most a lender will give against it (e.g. 65% of property value).',
    field: 'money',
    writes: ['collateralValue'],
    moves: 'max amount (LTV cap)',
    applies: (i) =>
      i.collateralKind === 'property' ||
      i.collateralKind === 'gold' ||
      i.collateralKind === 'vehicle' ||
      i.purpose === 'home',
    skippable: true,
    placeholder: '45,00,000',
  },
  {
    id: 'coApplicantIncome',
    tier: 'additional',
    label: 'Co-applicant monthly income (spouse / parent)?',
    help: 'A co-applicant with income lifts the lender\'s sanction (household FOIR) — but your own safe ceiling is still personal.',
    field: 'money',
    writes: ['coApplicantIncome'],
    moves: 'lender sanction amount',
    applies: () => true,
    skippable: true,
    placeholder: '18,000',
  },
  {
    id: 'monthlyIncomeFromLoan',
    tier: 'additional',
    label: 'Will this loan add to your monthly income? By how much?',
    help: 'A productive loan (stock, a delivery vehicle) partly self-pays its EMI. This is why a business loan can be worth it.',
    field: 'money',
    writes: ['monthlyIncomeFromLoan'],
    moves: 'verdict (productive flag)',
    applies: (i) => ['business', 'vehicle'].includes(i.purpose ?? ''),
    skippable: true,
    placeholder: '8,000',
  },
  {
    id: 'upcomingLargeExpense',
    tier: 'additional',
    label: 'Any big expense coming in the next year (school, illness)?',
    help: 'We spread this over 12 months and hold it out of your surplus so the EMI doesn\'t break when it lands.',
    field: 'money',
    writes: ['upcomingLargeExpense'],
    moves: 'safe surplus · EMI ceiling',
    applies: () => true,
    skippable: true,
    placeholder: '0',
  },
  {
    id: 'tenureYears',
    tier: 'additional',
    label: 'Preferred tenure?',
    help: 'Longer tenure = lower EMI but more total interest. We show the trade-off either way.',
    field: 'select',
    options: TENURE_OPTS,
    writes: ['tenureYears'],
    moves: 'EMI · amount · total interest',
    applies: () => true,
    skippable: true,
  },
  {
    id: 'offeredRate',
    tier: 'additional',
    label: 'Has a lender already quoted you a rate? (%)',
    help: 'We drop it on the Negotiation Card next to your fair band, so you can see if it is fair or not.',
    field: 'number',
    writes: ['offeredRate'],
    moves: 'comparison on the Card',
    applies: () => true,
    skippable: true,
    placeholder: '14',
  },
]

// The adaptive sequence: musts first, then each additional that currently
// applies. Returns only questions not yet answered (answer present in input).
export function pendingQuestions(input: BorrowerInput): Question[] {
  return QUESTIONS.filter((q) => q.applies(input)).filter((q) => !isAnswered(q, input))
}

export function isAnswered(q: Question, input: BorrowerInput): boolean {
  if (q.field === 'range') {
    return input.incomeLow !== undefined && input.incomeHigh !== undefined
  }
  if (q.field === 'score') {
    return input.creditScore !== undefined
  }
  const v = input[q.writes[0]]
  return v !== undefined && !(typeof v === 'number' && Number.isNaN(v))
}

// Count answered for the confidence meter.
export function answeredCount(input: BorrowerInput): number {
  return QUESTIONS.filter((q) => q.applies(input) && isAnswered(q, input)).length
}

// Default an unanswered additional question so the engine always has a value
// to run on. Must-questions are never defaulted — they are required.
export function applyDefaults(input: BorrowerInput): BorrowerInput {
  const out = { ...input }
  for (const q of QUESTIONS) {
    if (q.tier === 'must') continue
    if (!q.applies(out)) continue
    if (isAnswered(q, out)) continue
    const k = q.writes[0]
    if (out[k] === undefined) {
      // safe, neutral defaults that keep ranges WIDE (rule: confidence widens
      // with silence — never narrow a range you have no basis to narrow)
      ;(out as Record<string, unknown>)[k as string] = defaultFor(q)
    }
  }
  return out
}

function defaultFor(q: Question): unknown {
  switch (q.id) {
    case 'collateralKind':
      return 'none'
    case 'hasITR':
      return false
    case 'incomeRange':
      return undefined // leave unknown → wide band (intentional)
    case 'cardUtilisationPct':
      return undefined // no card / skipped → no discount or penalty
    default:
      return 0
  }
}

export function asPurpose(v: string): LoanPurpose {
  return v as LoanPurpose
}
