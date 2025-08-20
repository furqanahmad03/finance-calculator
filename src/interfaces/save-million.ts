export interface SaveMillionForm {
  // Required Fields
  savingsGoal: string;
  currentAge: string;
  targetAge: string;
  currentSavings: string;
  contributionAmount: string;
  contributionFrequency: string;
  annualInterestRate: string;
}

export interface SaveMillionResults {
  yearsToGoal: number;
  monthsToGoal: number;
  totalContributed: string;
  interestEarned: string;
  finalBalance: string;
  monthlyContributionNeeded: string;
  achievable: boolean;
  projectedGrowth: Array<{
    year: number;
    balance: string;
    contribution: string;
    interest: string;
  }>;
}