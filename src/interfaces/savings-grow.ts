export interface SavingsGrowForm {
  // Required Fields
  initialBalance: string;
  annualInterestRate: string;
  contributionAmount: string;
  contributionFrequency: string;
  years: string;

  // Optional Fields
  compoundingFrequency: string;
}

export interface SavingsGrowResults {
  finalBalance: string;
  totalContributed: string;
  interestEarned: string;
  growthChart: Array<{
    year: number;
    balance: string;
    contribution: string;
    interest: string;
    totalContributed: string;
  }>;
  breakdown: {
    initialAmount: string;
    contributionsTotal: string;
    interestTotal: string;
    growthPercentage: string;
  };
}
