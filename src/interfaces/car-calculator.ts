export interface CarCalculatorForm {
  carPrice: string;
  downPayment: string;
  tradeInValue: string;
  outstandingLoanBalance: string;
  loanTerm: string;
  interestRate: string;
  monthlyPaymentBudget: string;
  salesTaxRate: string;

  dealerRebates: string;
  additionalFees: string;
  desiredPayoffHorizon: string;
  incomeGuidelinePercentage: string;
  monthlyIncome: string;
}

export interface CarCalculatorResults {
  carPrice: string;
  salesTax: string;
  monthlyPayment: string;
  monthlyPaymentForDesiredHorizon: string;
  totalPayment: string;
  totalInterest: string;
  loanAmount: string;
  downPaymentAmount: string;
  tradeInNetValue: string;
  totalCost: string;
  affordabilityCheck: string;
  maxAffordableCarPrice: string;
  maxAffordableLoanAmount: string;
  budgetUtilization: string;
  incomeGuidelineCheck: string;
  incomeUtilization: string;
}
