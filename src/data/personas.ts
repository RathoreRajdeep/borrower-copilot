import type { BorrowerInput } from '../types'

// The three borrowers from the brief. Used for the run-throughs and as
// one-click demo loads in the UI. These are the exact inputs the evaluator
// will re-run, so they match the persona text precisely.

export interface Persona {
  id: string
  name: string
  who: string
  where: string
  blurb: string
  ask: string
  input: BorrowerInput
}

export const PERSONAS: Persona[] = [
  {
    id: 'priya',
    name: 'Priya',
    who: 'Priya, 29',
    where: 'Bengaluru · salaried',
    blurb:
      'Software engineer at a large MNC for 5 years. Net ₹1,10,000/month. One car loan, EMI ₹14,000, 2 years left. Credit score 780. Rents at ₹28,000.',
    ask: 'Wants ₹8,00,000 personal loan for a wedding.',
    input: {
      purpose: 'wedding',
      amountWanted: 800000,
      incomeType: 'salaried',
      incomeStated: 110000,
      existingEMIs: 14000,
      householdExpenses: 45000,
      age: 29,
      creditScore: 780,
      // additional
      yearsInIncome: 5,
      activeLoanCount: 1,
      bouncesLast6m: 0,
      cardUtilisationPct: 25,
      emergencySavingsMonths: 4,
      dependents: 0,
      collateralKind: 'none',
      coApplicantIncome: 0,
      monthlyIncomeFromLoan: 0,
      upcomingLargeExpense: 0,
      tenureYears: 4,
    },
  },
  {
    id: 'ravi',
    name: 'Ravi',
    who: 'Ravi, 42',
    where: 'Mysuru · self-employed',
    blurb:
      'Kirana store for 14 years. Cash income ₹40,000–80,000/month; ITR shows ₹4,20,000/year. Owns the shop premises, about ₹45,00,000, unencumbered. Never taken a formal loan; no credit score. Wife earns ₹18,000 teaching.',
    ask: 'Wants ₹15,00,000 for a second stock line and a delivery vehicle.',
    input: {
      purpose: 'business',
      amountWanted: 1500000,
      incomeType: 'self-employed',
      incomeStated: 35000, // ITR ₹4,20,000 / 12
      incomeLow: 40000,
      incomeHigh: 80000,
      existingEMIs: 0,
      householdExpenses: 22000,
      age: 42,
      creditScore: 'none',
      // additional
      yearsInIncome: 14,
      hasITR: true,
      activeLoanCount: 0,
      bouncesLast6m: 0,
      emergencySavingsMonths: 2,
      dependents: 2,
      collateralKind: 'property',
      collateralValue: 4500000,
      coApplicantIncome: 18000,
      monthlyIncomeFromLoan: 12000,
      upcomingLargeExpense: 0,
      tenureYears: 10,
    },
  },
  {
    id: 'anita',
    name: 'Anita',
    who: 'Anita, 35',
    where: 'Hubballi · informal',
    blurb:
      'Delivery-platform rider plus home tailoring. ₹26,000–30,000/month, two children, husband unemployed 8 months. Three app loans, ₹35,000 outstanding at 30%+, one EMI bounced last month.',
    ask: 'Wants ₹1,50,000 for an electric scooter to double delivery runs.',
    input: {
      purpose: 'vehicle',
      amountWanted: 150000,
      incomeType: 'informal',
      incomeStated: 28000,
      incomeLow: 26000,
      incomeHigh: 30000,
      existingEMIs: 5000,
      householdExpenses: 23000,
      age: 35,
      creditScore: 'unknown',
      // additional
      yearsInIncome: 1,
      hasITR: false,
      activeLoanCount: 3,
      bouncesLast6m: 1,
      cardUtilisationPct: 90,
      emergencySavingsMonths: 0,
      dependents: 3,
      collateralKind: 'gold',
      collateralValue: 60000,
      coApplicantIncome: 0,
      monthlyIncomeFromLoan: 6000,
      upcomingLargeExpense: 0,
      tenureYears: 3,
    },
  },
]
