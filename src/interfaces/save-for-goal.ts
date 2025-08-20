export interface SaveForGoalForm {
  // Required Fields
  goalAmount: string;
  currentSavings: string;
  otherIncome: string;
  contributionAmount: string;
  contributionFrequency: string;

  // Optional Fields
  annualInterestRate: string;
  targetTimeline: string;
  timelineUnit: string;
}

export interface SaveForGoalResults {
  monthsToGoal: number;
  yearsToGoal: number;
  projectedBalance: string;
  shortfall: string;
  requiredMonthly: string;
  totalContributed: string;
  interestEarned: string;
  achievable: boolean;
  projectedGrowth: Array<{
    month: number;
    balance: string;
    contribution: string;
    interest: string;
  }>;
}
