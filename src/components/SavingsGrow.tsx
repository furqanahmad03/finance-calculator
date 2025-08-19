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
  AreaChart,
  Area,
} from "recharts";
import CalculatorLayout from "./CalculatorLayout";
import {
  TrendingUp,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  PiggyBank,
  Clock,
  BarChart3,
} from "lucide-react";

interface SavingsGrowForm {
  // Required Fields
  initialBalance: string;
  annualInterestRate: string;
  contributionAmount: string;
  contributionFrequency: string;
  years: string;
  
  // Optional Fields
  compoundingFrequency: string;
}

interface SavingsGrowResults {
  finalBalance: string;
  totalContributed: string;
  interestEarned: string;
  growthChart: Array<{ year: number; balance: string; contribution: string; interest: string; totalContributed: string }>;
  breakdown: {
    initialAmount: string;
    contributionsTotal: string;
    interestTotal: string;
    growthPercentage: string;
  };
}

export default function SavingsGrow() {
  const [formData, setFormData] = useState<SavingsGrowForm>({
    initialBalance: "",
    annualInterestRate: "",
    contributionAmount: "",
    contributionFrequency: "yearly",
    years: "",
    compoundingFrequency: "monthly",
  });

  const [results, setResults] = useState<SavingsGrowResults | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGrowth = () => {
    // Parse form data
    const initialBalance = parseFloat(formData.initialBalance) || 0;
    const annualInterestRate = parseFloat(formData.annualInterestRate) || 0;
    const contributionAmount = parseFloat(formData.contributionAmount) || 0;
    const years = parseFloat(formData.years) || 0;

    // Calculate compounding periods per year
    let compoundingPeriodsPerYear = 1;
    switch (formData.compoundingFrequency) {
      case "daily":
        compoundingPeriodsPerYear = 365;
        break;
      case "monthly":
        compoundingPeriodsPerYear = 12;
        break;
      case "quarterly":
        compoundingPeriodsPerYear = 4;
        break;
      case "yearly":
        compoundingPeriodsPerYear = 1;
        break;
      default:
        compoundingPeriodsPerYear = 12;
    }

    // Calculate contribution frequency multiplier
    let contributionMultiplier = 1;
    switch (formData.contributionFrequency) {
      case "monthly":
        contributionMultiplier = 12;
        break;
      case "quarterly":
        contributionMultiplier = 4;
        break;
      case "yearly":
        contributionMultiplier = 1;
        break;
      case "weekly":
        contributionMultiplier = 52;
        break;
      case "biweekly":
        contributionMultiplier = 26;
        break;
      default:
        contributionMultiplier = 1;
    }

    // Calculate periodic interest rate
    const periodicInterestRate = annualInterestRate / 100 / compoundingPeriodsPerYear;
    
    // Calculate periodic contribution
    const periodicContribution = contributionAmount / contributionMultiplier;

    // Calculate total periods
    const totalPeriods = years * compoundingPeriodsPerYear;

    let currentBalance = initialBalance;
    const growthChart = [];
    let totalContributed = 0;
    let totalInterest = 0;

    // Calculate growth year by year
    for (let year = 1; year <= years; year++) {
      const yearStartBalance = currentBalance;
      let yearContribution = 0;
      let yearInterest = 0;

      // Calculate compounding for the year
      for (let period = 1; period <= compoundingPeriodsPerYear; period++) {
        const periodStartBalance = currentBalance;
        
        // Apply compound interest
        currentBalance = periodStartBalance * (1 + periodicInterestRate);
        
        // Add contribution
        currentBalance += periodicContribution;
        
        yearContribution += periodicContribution;
        yearInterest += (currentBalance - periodStartBalance - periodicContribution);
      }

      totalContributed += yearContribution;
      totalInterest += yearInterest;

      growthChart.push({
        year: year,
        balance: currentBalance.toFixed(2),
        contribution: yearContribution.toFixed(2),
        interest: yearInterest.toFixed(2),
        totalContributed: totalContributed.toFixed(2),
      });
    }

    // Calculate final values
    const finalBalance = currentBalance;
    const interestEarned = totalInterest;
    const growthPercentage = ((finalBalance - initialBalance) / initialBalance * 100);

    setResults({
      finalBalance: finalBalance.toFixed(2),
      totalContributed: totalContributed.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
      growthChart,
      breakdown: {
        initialAmount: initialBalance.toFixed(2),
        contributionsTotal: totalContributed.toFixed(2),
        interestTotal: interestEarned.toFixed(2),
        growthPercentage: growthPercentage.toFixed(2),
      },
    });
  };

  const isFormValid = () => {
    return (
      formData.initialBalance &&
      formData.annualInterestRate &&
      formData.contributionAmount &&
      formData.years
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

  const formatPercentage = (value: string) => {
    return `${parseFloat(value).toFixed(2)}%`;
  };

  return (
    <CalculatorLayout
      title="Savings Growth Calculator"
      description="Calculate how your savings will grow over time with compound interest and regular contributions"
      icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-emerald-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-emerald-600 to-emerald-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>Required Information</span>
            </CardTitle>
            <p className="text-emerald-100 text-sm font-normal mt-1">
              Fill in these details to see how your savings will grow over time
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="initialBalance"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Initial Balance / Starting Deposit</span>
                  </label>
                  <Input
                    type="number"
                    id="initialBalance"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleInputChange}
                    placeholder="10,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your starting savings amount
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Expected Annual Interest Rate</span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder="5.5"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    APY / annual return rate
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Regular Contribution Amount</span>
                  </label>
                  <Input
                    type="number"
                    id="contributionAmount"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    placeholder="5,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Amount you will add each year
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Contribution Frequency</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium">
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
                    How often you contribute (optional if not fixed annual)
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="years"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Number of Years</span>
                  </label>
                  <Input
                    type="number"
                    id="years"
                    name="years"
                    value={formData.years}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Time horizon for your savings
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="compoundingFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Compounding Frequency</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("compoundingFrequency", value)
                    }
                    defaultValue={formData.compoundingFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How often interest compounds (optional for precision)
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateGrowth}
                  disabled={!isFormValid()}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Growth
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-emerald-600 to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingUp className="w-6 h-6 text-yellow-300" />
                <span>Your Savings Growth Projection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">Final Balance</h3>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(results.finalBalance)}
                    </div>
                    <div className="text-sm text-emerald-600">
                      After {formData.years} years
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
                      Regular contributions
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
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
                      <Percent className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">Growth %</h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatPercentage(results.breakdown.growthPercentage)}
                    </div>
                    <div className="text-sm text-orange-600">
                      Total return
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Savings Growth Over Time</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.growthChart}>
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
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Breakdown Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Breakdown of Final Balance</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.growthChart}>
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
                          formatter={(value: any) => [formatCurrency(value), 'Amount']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="totalContributed" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          name="Total Contributed"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interest" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          name="Interest Earned"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-emerald-200 pb-2 flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span>Growth Breakdown</span>
                    </h4>
                    <div className="pt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Initial Amount:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.initialAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Contributions:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.contributionsTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Interest Earned:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.interestTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Growth %:</span>
                        <span className="font-semibold text-gray-900">{formatPercentage(results.breakdown.growthPercentage)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Projection Summary</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Time Period:</span>
                        <span className="font-semibold text-gray-900">{formData.years} years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Contribution Frequency:</span>
                        <span className="font-semibold text-gray-900">{formData.contributionFrequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Compounding:</span>
                        <span className="font-semibold text-gray-900">{formData.compoundingFrequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Annual Rate:</span>
                        <span className="font-semibold text-gray-900">{formData.annualInterestRate}%</span>
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
