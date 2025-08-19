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
  Gift,
} from "lucide-react";

interface SaveForGoalForm {
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

interface SaveForGoalResults {
  monthsToGoal: number;
  yearsToGoal: number;
  projectedBalance: string;
  shortfall: string;
  requiredMonthly: string;
  totalContributed: string;
  interestEarned: string;
  achievable: boolean;
  projectedGrowth: Array<{ month: number; balance: string; contribution: string; interest: string }>;
}

export default function SaveForGoal() {
  const [formData, setFormData] = useState<SaveForGoalForm>({
    goalAmount: "",
    currentSavings: "",
    otherIncome: "",
    contributionAmount: "",
    contributionFrequency: "monthly",
    annualInterestRate: "0",
    targetTimeline: "",
    timelineUnit: "months",
  });

  const [results, setResults] = useState<SaveForGoalResults | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGoal = () => {
    // Parse form data
    const goalAmount = parseFloat(formData.goalAmount) || 0;
    const currentSavings = parseFloat(formData.currentSavings) || 0;
    const otherIncome = parseFloat(formData.otherIncome) || 0;
    const contributionAmount = parseFloat(formData.contributionAmount) || 0;
    const annualInterestRate = parseFloat(formData.annualInterestRate) || 0;
    const targetTimeline = parseFloat(formData.targetTimeline) || 0;

    // Calculate total available funds
    const totalAvailable = currentSavings + otherIncome;
    const shortfall = goalAmount - totalAvailable;

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

    let monthsToGoal = 0;
    let projectedBalance = totalAvailable;
    let totalContributed = 0;
    let interestEarned = 0;
    const projectedGrowth = [];

    // If target timeline is specified, calculate if goal is achievable
    if (targetTimeline > 0) {
      const timelineMonths = formData.timelineUnit === "years" ? targetTimeline * 12 : targetTimeline;
      
      // Project growth over the specified timeline
      for (let month = 1; month <= timelineMonths; month++) {
        const monthStartBalance = projectedBalance;
        projectedBalance = monthStartBalance * (1 + monthlyInterestRate) + monthlyContribution;
        totalContributed += monthlyContribution;
        interestEarned += (projectedBalance - monthStartBalance - monthlyContribution);
        
        if (month % 12 === 0) { // Record yearly data
          projectedGrowth.push({
            month: month,
            balance: projectedBalance.toFixed(2),
            contribution: (monthlyContribution * 12).toFixed(2),
            interest: (projectedBalance - monthStartBalance - monthlyContribution * 12).toFixed(2),
          });
        }
      }
      
      monthsToGoal = timelineMonths;
    } else {
      // Calculate how long it will take to reach the goal
      let month = 0;
      while (projectedBalance < goalAmount && month < 600) { // Cap at 50 years
        month++;
        const monthStartBalance = projectedBalance;
        projectedBalance = monthStartBalance * (1 + monthlyInterestRate) + monthlyContribution;
        totalContributed += monthlyContribution;
        interestEarned += (projectedBalance - monthStartBalance - monthlyContribution);
        
        if (month % 12 === 0) { // Record yearly data
          projectedGrowth.push({
            month: month,
            balance: projectedBalance.toFixed(2),
            contribution: (monthlyContribution * 12).toFixed(2),
            interest: (projectedBalance - monthStartBalance - monthlyContribution * 12).toFixed(2),
          });
        }
      }
      
      monthsToGoal = month;
    }

    const yearsToGoal = monthsToGoal / 12;

    // Calculate required monthly contribution to reach goal in target timeline
    let requiredMonthly = 0;
    if (targetTimeline > 0 && monthlyInterestRate > 0) {
      const timelineMonths = formData.timelineUnit === "years" ? targetTimeline * 12 : targetTimeline;
      requiredMonthly = ((goalAmount - totalAvailable * Math.pow(1 + monthlyInterestRate, timelineMonths)) / 
        ((Math.pow(1 + monthlyInterestRate, timelineMonths) - 1) / monthlyInterestRate));
    }

    const achievable = projectedBalance >= goalAmount;

    setResults({
      monthsToGoal: Math.ceil(monthsToGoal),
      yearsToGoal: Math.ceil(yearsToGoal * 10) / 10,
      projectedBalance: projectedBalance.toFixed(2),
      shortfall: shortfall.toFixed(2),
      requiredMonthly: requiredMonthly.toFixed(2),
      totalContributed: totalContributed.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
      achievable,
      projectedGrowth,
    });
  };

  const isFormValid = () => {
    return (
      formData.goalAmount &&
      formData.currentSavings &&
      formData.contributionAmount
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
      title="Save For Goal Calculator"
      description="Calculate how to reach your specific savings goal with regular contributions and compound interest"
      icon={<Target className="w-6 h-6 text-purple-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-purple-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>Required Information</span>
            </CardTitle>
            <p className="text-purple-100 text-sm font-normal mt-1">
              Fill in these essential details to calculate your path to your specific goal
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="goalAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Total Desired Goal / Item Cost</span>
                  </label>
                  <Input
                    type="number"
                    id="goalAmount"
                    name="goalAmount"
                    value={formData.goalAmount}
                    onChange={handleInputChange}
                    placeholder="5,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    The total cost of what you want to save for
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentSavings"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Current Savings Balance</span>
                  </label>
                  <Input
                    type="number"
                    id="currentSavings"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleInputChange}
                    placeholder="1,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    How much do you currently have saved?
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="otherIncome"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Other Income (Monetary Gifts)</span>
                  </label>
                  <Input
                    type="number"
                    id="otherIncome"
                    name="otherIncome"
                    value={formData.otherIncome}
                    onChange={handleInputChange}
                    placeholder="500"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    One-time contributions, gifts, or other income
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Regular Savings Contribution</span>
                  </label>
                  <Input
                    type="number"
                    id="contributionAmount"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    placeholder="200"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    How much are you contributing to your savings?
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Contribution Frequency</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium">
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
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Annual Interest Rate (Optional)</span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder="5.0"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Expected annual return rate (APY) - leave as 0 if no growth
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="targetTimeline"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Target Timeline (Optional)</span>
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      id="targetTimeline"
                      name="targetTimeline"
                      value={formData.targetTimeline}
                      onChange={handleInputChange}
                      placeholder="12"
                      className="flex-1 h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("timelineUnit", value)
                      }
                      defaultValue={formData.timelineUnit}
                    >
                      <SelectTrigger className="w-32 !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">
                    How fast you want to reach your goal (optional)
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateGoal}
                  disabled={!isFormValid()}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingUp className="w-6 h-6 text-yellow-300" />
                <span>Your Path to {formatCurrency(formData.goalAmount)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Time to Goal</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {results.yearsToGoal} years
                    </div>
                    <div className="text-sm text-purple-600">
                      {results.monthsToGoal} months
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Gift className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Current Gap</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.shortfall)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Still need to save
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <PiggyBank className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Total Contributed</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(results.totalContributed)}
                    </div>
                    <div className="text-sm text-green-600">
                      Over {results.yearsToGoal} years
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">Final Balance</h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.projectedBalance)}
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
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Projected Growth Over Time</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projectedGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${Math.floor(value / 12)}y ${value % 12}m`}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Balance']}
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-purple-200 pb-2 flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span>Required Monthly Contribution</span>
                    </h4>
                    <div className="pt-3">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {formData.targetTimeline ? formatCurrency(results.requiredMonthly) : 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.targetTimeline 
                          ? `To reach your goal of ${formatCurrency(formData.goalAmount)} in ${formData.targetTimeline} ${formData.timelineUnit}`
                          : 'Set a target timeline to see required monthly contribution'
                        }
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
                        <span className="text-gray-700 text-sm">Goal Amount:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(formData.goalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Current Savings:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(formData.currentSavings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Other Income:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(formData.otherIncome)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Time to Goal:</span>
                        <span className="font-semibold text-gray-900">{results.yearsToGoal} years</span>
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
