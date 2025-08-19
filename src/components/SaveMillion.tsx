"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CalculatorLayout from "./CalculatorLayout";
import {
  Target,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  PiggyBank,
  TrendingUp,
  Clock,
} from "lucide-react";

interface SaveMillionForm {
  // Required Fields
  savingsGoal: string;
  currentAge: string;
  targetAge: string;
  currentSavings: string;
  contributionAmount: string;
  contributionFrequency: string;
  annualInterestRate: string;
}

interface SaveMillionResults {
  yearsToGoal: number;
  monthsToGoal: number;
  totalContributed: string;
  interestEarned: string;
  finalBalance: string;
  monthlyContributionNeeded: string;
  achievable: boolean;
  projectedGrowth: Array<{ year: number; balance: string; contribution: string; interest: string }>;
}

export default function SaveMillion() {
  const [formData, setFormData] = useState<SaveMillionForm>({
    savingsGoal: "1000000",
    currentAge: "",
    targetAge: "",
    currentSavings: "",
    contributionAmount: "",
    contributionFrequency: "monthly",
    annualInterestRate: "",
  });

  const [results, setResults] = useState<SaveMillionResults | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSavings = () => {
    // Parse form data
    const savingsGoal = parseFloat(formData.savingsGoal) || 0;
    const currentAge = parseFloat(formData.currentAge) || 0;
    const targetAge = parseFloat(formData.targetAge) || 0;
    const currentSavings = parseFloat(formData.currentSavings) || 0;
    const contributionAmount = parseFloat(formData.contributionAmount) || 0;
    const annualInterestRate = parseFloat(formData.annualInterestRate) || 0;

    // Calculate time to goal
    const yearsToGoal = targetAge - currentAge;
    const monthsToGoal = yearsToGoal * 12;

    // Convert contribution frequency to monthly equivalent
    let monthlyContribution = 0;
    switch (formData.contributionFrequency) {
      case "monthly":
        monthlyContribution = contributionAmount;
        break;
      case "quarterly":
        monthlyContribution = contributionAmount / 3;
        break;
      case "yearly":
        monthlyContribution = contributionAmount / 12;
        break;
      case "weekly":
        monthlyContribution = contributionAmount * 4.33; // Average weeks per month
        break;
      case "biweekly":
        monthlyContribution = contributionAmount * 2.17; // Average biweekly periods per month
        break;
      default:
        monthlyContribution = contributionAmount;
    }

    // Calculate monthly interest rate
    const monthlyInterestRate = annualInterestRate / 100 / 12;

    // Calculate future value with compound interest
    let futureValue = currentSavings;
    const projectedGrowth = [];
    
    for (let year = 0; year <= yearsToGoal; year++) {
      const yearStartBalance = futureValue;
      let yearContribution = 0;
      let yearInterest = 0;
      
      // Calculate monthly compounding for the year
      for (let month = 1; month <= 12; month++) {
        const monthStartBalance = futureValue;
        futureValue = monthStartBalance * (1 + monthlyInterestRate) + monthlyContribution;
        yearContribution += monthlyContribution;
        yearInterest += (futureValue - monthStartBalance - monthlyContribution);
      }
      
      projectedGrowth.push({
        year: currentAge + year,
        balance: futureValue.toFixed(2),
        contribution: yearContribution.toFixed(2),
        interest: yearInterest.toFixed(2),
      });
    }

    // Calculate total contributions and interest
    const totalContributed = (monthlyContribution * monthsToGoal).toFixed(2);
    const interestEarned = (futureValue - currentSavings - parseFloat(totalContributed)).toFixed(2);

    // Calculate required monthly contribution to reach goal
    let requiredMonthly = 0;
    if (yearsToGoal > 0 && monthlyInterestRate > 0) {
      requiredMonthly = ((savingsGoal - currentSavings * Math.pow(1 + monthlyInterestRate, monthsToGoal)) / 
        ((Math.pow(1 + monthlyInterestRate, monthsToGoal) - 1) / monthlyInterestRate));
    }

    const achievable = futureValue >= savingsGoal;

    setResults({
      yearsToGoal,
      monthsToGoal,
      totalContributed,
      interestEarned,
      finalBalance: futureValue.toFixed(2),
      monthlyContributionNeeded: requiredMonthly.toString(),
      achievable,
      projectedGrowth,
    });
  };

  const isFormValid = () => {
    return (
      formData.savingsGoal &&
      formData.currentAge &&
      formData.targetAge &&
      formData.currentSavings &&
      formData.contributionAmount &&
      formData.annualInterestRate
    );
  };

  const formatCurrency = (value: string) => {
    return parseFloat(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <CalculatorLayout
      title="Save Million Calculator"
      description="Calculate how long it will take to reach your savings goal with compound interest"
      icon={<Target className="w-6 h-6 text-green-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-green-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>Required Information</span>
            </CardTitle>
            <p className="text-green-100 text-sm font-normal mt-1">
              Fill in these essential details to calculate your path to your savings goal
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="savingsGoal"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Savings Goal</span>
                  </label>
                  <Input
                    type="number"
                    id="savingsGoal"
                    name="savingsGoal"
                    value={formData.savingsGoal}
                    onChange={handleInputChange}
                    placeholder="1,000,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your target savings amount (default: $1,000,000)
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentAge"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Current Age</span>
                  </label>
                  <Input
                    type="number"
                    id="currentAge"
                    name="currentAge"
                    value={formData.currentAge}
                    onChange={handleInputChange}
                    placeholder="30"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your current age in years
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="targetAge"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Target Age</span>
                  </label>
                  <Input
                    type="number"
                    id="targetAge"
                    name="targetAge"
                    value={formData.targetAge}
                    onChange={handleInputChange}
                    placeholder="65"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Age when you want to reach your goal
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentSavings"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Current Savings</span>
                  </label>
                  <Input
                    type="number"
                    id="currentSavings"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleInputChange}
                    placeholder="50,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Money you currently have saved
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Contribution Amount</span>
                  </label>
                  <Input
                    type="number"
                    id="contributionAmount"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    placeholder="1,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Amount you are depositing regularly
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Contribution Frequency</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How frequently are you contributing?
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Annual Interest Rate</span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder="7.5"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Expected annual return rate (APY)
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateSavings}
                  disabled={!isFormValid()}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Path to Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingUp className="w-6 h-6 text-yellow-300" />
                <span>Your Path to {formatCurrency(formData.savingsGoal)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Time to Goal</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {results.yearsToGoal} years
                    </div>
                    <div className="text-sm text-green-600">
                      {results.monthsToGoal} months
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Total Contributed</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.totalContributed)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Over {results.yearsToGoal} years
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Interest Earned</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(results.interestEarned)}
                    </div>
                    <div className="text-sm text-purple-600">
                      Compound growth
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">Final Balance</h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.finalBalance)}
                    </div>
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      results.achievable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {results.achievable ? 'Goal Achieved!' : 'Below Goal'}
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Projected Growth Over Time</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projectedGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Balance']}
                          labelFormatter={(label) => `Age ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-green-200 pb-2 flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-green-600" />
                      <span>Required Monthly Contribution</span>
                    </h4>
                    <div className="pt-3">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(results.monthlyContributionNeeded)}
                      </div>
                      <p className="text-sm text-gray-600">
                        To reach your goal of {formatCurrency(formData.savingsGoal)} by age {formData.targetAge}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Timeline Summary</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Start Age:</span>
                        <span className="font-semibold text-gray-900">{formData.currentAge}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Target Age:</span>
                        <span className="font-semibold text-gray-900">{formData.targetAge}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Years to Goal:</span>
                        <span className="font-semibold text-gray-900">{results.yearsToGoal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Months to Goal:</span>
                        <span className="font-semibold text-gray-900">{results.monthsToGoal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CalculatorLayout>
  );
}
