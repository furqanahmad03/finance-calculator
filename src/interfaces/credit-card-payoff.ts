export interface CreditCardPayoffForm {
  balance: string;
  annualInterestRate: string;
  paymentApproach: "monthly-payment" | "payoff-timeline";
  monthlyPayment: string;
  payoffMonths: string;
}

export interface CreditCardPayoffResults {
  monthsToPayoff: number;
  requiredMonthlyPayment: string;
  totalInterest: string;
  totalCost: string;
  payoffDate: string;
  savings: string;
  projectedPayoff: Array<{
    month: number;
    balance: string;
    payment: string;
    interest: string;
    principal: string;
  }>;
}
