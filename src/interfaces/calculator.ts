// Calculator Layout Interface
export interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

// Main Calculator Interface for Calculators.tsx
export interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

// Car Calculator Interfaces
export interface CarCalculatorForm {
  carPrice: string;
  downPayment: string;
  loanTerm: string;
  interestRate: string;
}

export interface CarCalculatorResults {
  monthlyPayment: string;
  totalPayment: string;
  totalInterest: string;
  loanAmount: string;
}

// Save Million Calculator Interfaces
export interface SaveMillionForm {
  currentSavings: string;
  monthlyContribution: string;
  annualReturn: string;
  targetAmount: string;
}

export interface SaveMillionResults {
  years: number;
  months: number;
  totalContributed: string;
  interestEarned: string;
  finalBalance: string;
  achievable: boolean;
}

// Save For Goal Calculator Interfaces
export interface SaveForGoalForm {
  goalAmount: string;
  currentSavings: string;
  monthlyContribution: string;
  annualReturn: string;
  targetDate: string;
}

export interface SaveForGoalResults {
  monthsToGoal: number;
  projectedBalance: string;
  shortfall: string;
  requiredMonthly: string;
  totalContributed: string;
  achievable: boolean;
}

// Savings Growth Calculator Interfaces
export interface SavingsGrowthForm {
  initialAmount: string;
  monthlyContribution: string;
  annualReturn: string;
  years: string;
}

export interface SavingsGrowthResults {
  finalBalance: string;
  totalContributed: string;
  interestEarned: string;
  growthChart: Array<{ year: number; balance: string; contribution: string; interest: string }>;
}

// Paycheck Calculator Interfaces
export interface PaycheckForm {
  grossSalary: string;
  federalTaxRate: string;
  stateTaxRate: string;
  socialSecurity: string;
  medicare: string;
  otherDeductions: string;
}

export interface PaycheckResults {
  grossPay: string;
  federalTax: string;
  stateTax: string;
  socialSecurityTax: string;
  medicareTax: string;
  otherDeductions: string;
  netPay: string;
  takeHomePercentage: string;
}

// Credit Card Payoff Calculator Interfaces
export interface CreditCardForm {
  balance: string;
  interestRate: string;
  monthlyPayment: string;
  additionalPayment: string;
}

export interface CreditCardResults {
  monthsToPayoff: number;
  totalInterest: string;
  totalPayment: string;
  payoffDate: string;
  savings: string;
}
