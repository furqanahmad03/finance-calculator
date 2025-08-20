export interface PayCheckForm {
  annualSalary: string;
  payFrequency: string;
  filingStatus: string;
  taxYear: string;
  stateTaxRate: string;
  cityTaxRate: string;
  isSelfEmployed: boolean;

  otherEarnedIncome: string;
  unearnedIncome: string;
  childrenUnder17: string;
  otherDependents: string;

  retirement401k: string;
  healthInsurance: string;
  hsaFsa: string;
  otherPreTax: string;

  iraContributions: string;
  studentLoanInterest: string;
  otherAdjustments: string;

  mortgageInterest: string;
  charitableDonations: string;
  stateLocalTaxes: string;
  propertyTaxes: string;
  salesTaxes: string;
  medicalExpenses: string;
}

export interface PayCheckResults {
  grossPay: string;
  federalTax: string;
  stateTax: string;
  cityTax: string;
  socialSecurityTax: string;
  medicareTax: string;
  preTaxDeductions: string;
  postTaxAdjustments: string;
  itemizedDeductions: string;
  netPay: string;
  takeHomePercentage: string;
  effectiveTaxRate: string;
  grossAnnual: string;
  totalDeductions: string;
  netAnnual: string;
  taxCredits: string;
  breakdown: {
    grossAnnual: string;
    totalDeductions: string;
    totalTaxes: string;
    netAnnual: string;
  };
}
