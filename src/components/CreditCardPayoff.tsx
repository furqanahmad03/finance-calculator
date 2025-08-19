"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  CreditCard,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  TrendingDown,
  Clock,
  Target,
} from "lucide-react";

interface CreditCardPayoffForm {
  // Debt Details
  balance: string;
  annualInterestRate: string;
  
  // Payment Approach
  paymentApproach: "monthly-payment" | "payoff-timeline";
  
  // Monthly Payment (if approach 1)
  monthlyPayment: string;
  
  // Payoff Timeline (if approach 2)
  payoffMonths: string;
}

interface CreditCardPayoffResults {
  monthsToPayoff: number;
  requiredMonthlyPayment: string;
  totalInterest: string;
  totalCost: string;
  payoffDate: string;
  savings: string;
  projectedPayoff: Array<{ month: number; balance: string; payment: string; interest: string; principal: string }>;
}

export default function CreditCardPayoff() {
  const [formData, setFormData] = useState<CreditCardPayoffForm>({
    balance: "",
    annualInterestRate: "",
    paymentApproach: "monthly-payment",
    monthlyPayment: "",
    payoffMonths: "",
  });

  const [results, setResults] = useState<CreditCardPayoffResults | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      paymentApproach: value as "monthly-payment" | "payoff-timeline",
      monthlyPayment: value === "payoff-timeline" ? "" : prev.monthlyPayment,
      payoffMonths: value === "monthly-payment" ? "" : prev.payoffMonths,
    }));
  };

  const calculatePayoff = () => {
    // Parse form data
    const balance = parseFloat(formData.balance) || 0;
    const annualInterestRate = parseFloat(formData.annualInterestRate) || 0;
    const monthlyInterestRate = annualInterestRate / 100 / 12;

    let monthsToPayoff = 0;
    let requiredMonthlyPayment = 0;
    let totalInterest = 0;
    let projectedPayoff = [];

    if (formData.paymentApproach === "monthly-payment") {
      // Calculate months to payoff with fixed monthly payment
      const monthlyPayment = parseFloat(formData.monthlyPayment) || 0;
      
      if (monthlyPayment <= monthlyInterestRate * balance) {
        // Payment is too low to ever pay off the debt
        monthsToPayoff = Infinity;
        requiredMonthlyPayment = monthlyPayment;
        totalInterest = Infinity;
      } else {
        // Calculate months to payoff
        let remainingBalance = balance;
        let month = 0;
        
        while (remainingBalance > 0 && month < 600) { // Cap at 50 years
          month++;
          const interest = remainingBalance * monthlyInterestRate;
          const principal = monthlyPayment - interest;
          
          if (principal <= 0) {
            // Payment only covers interest
            monthsToPayoff = Infinity;
            totalInterest = Infinity;
            break;
          }
          
          remainingBalance = Math.max(0, remainingBalance - principal);
          totalInterest += interest;
          
          projectedPayoff.push({
            month: month,
            balance: remainingBalance.toFixed(2),
            payment: monthlyPayment.toFixed(2),
            interest: interest.toFixed(2),
            principal: principal.toFixed(2),
          });
        }
        
        if (month < 600) {
          monthsToPayoff = month;
        }
      }
      
      requiredMonthlyPayment = monthlyPayment;
    } else {
      // Calculate required monthly payment for desired timeline
      const targetMonths = parseFloat(formData.payoffMonths) || 0;
      
      if (targetMonths > 0 && monthlyInterestRate > 0) {
        // Calculate required monthly payment using amortization formula
        requiredMonthlyPayment = (balance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, targetMonths)) / 
          (Math.pow(1 + monthlyInterestRate, targetMonths) - 1);
        
        // Project payoff over the timeline
        let remainingBalance = balance;
        totalInterest = 0;
        
        for (let month = 1; month <= targetMonths; month++) {
          const interest = remainingBalance * monthlyInterestRate;
          const principal = requiredMonthlyPayment - interest;
          
          remainingBalance = Math.max(0, remainingBalance - principal);
          totalInterest += interest;
          
          projectedPayoff.push({
            month: month,
            balance: remainingBalance.toFixed(2),
            payment: requiredMonthlyPayment.toFixed(2),
            interest: interest.toFixed(2),
            principal: principal.toFixed(2),
          });
        }
        
        monthsToPayoff = targetMonths;
      }
    }

    // Calculate total cost and payoff date
    const totalCost = balance + totalInterest;
    const currentDate = new Date();
    const payoffDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthsToPayoff, currentDate.getDate());
    
    // Calculate potential savings (if paying minimum vs. calculated payment)
    const minimumPayment = Math.max(balance * 0.01, 25); // 1% of balance or $25 minimum
    let minimumMonths = 0;
    let minimumInterest = 0;
    
    if (minimumPayment > monthlyInterestRate * balance) {
      let remainingBalance = balance;
      while (remainingBalance > 0 && minimumMonths < 600) {
        minimumMonths++;
        const interest = remainingBalance * monthlyInterestRate;
        const principal = minimumPayment - interest;
        remainingBalance = Math.max(0, remainingBalance - principal);
        minimumInterest += interest;
      }
    }
    
    const savings = minimumInterest > 0 ? (minimumInterest - totalInterest).toFixed(2) : "0";

    setResults({
      monthsToPayoff: monthsToPayoff === Infinity ? 999 : monthsToPayoff,
      requiredMonthlyPayment: requiredMonthlyPayment.toFixed(2),
      totalInterest: totalInterest === Infinity ? "∞" : totalInterest.toFixed(2),
      totalCost: totalCost === Infinity ? "∞" : totalCost.toFixed(2),
      payoffDate: payoffDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      savings: savings,
      projectedPayoff: projectedPayoff,
    });
  };

  const isFormValid = () => {
    if (!formData.balance || !formData.annualInterestRate) return false;
    
    if (formData.paymentApproach === "monthly-payment") {
      return formData.monthlyPayment && parseFloat(formData.monthlyPayment) > 0;
    } else {
      return formData.payoffMonths && parseFloat(formData.payoffMonths) > 0;
    }
  };

  const formatCurrency = (value: string) => {
    if (value === "∞") return "∞";
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
      title="Credit Card Payoff Calculator"
      description="Calculate how long it will take to pay off your credit card debt or find the monthly payment needed"
      icon={<CreditCard className="w-6 h-6 text-red-600" />}
    >
      <div className="space-y-8">
        {/* Debt Details */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-red-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>Debt Details</span>
            </CardTitle>
            <p className="text-red-100 text-sm font-normal mt-1">
              Enter your credit card information to start calculating
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="balance"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Total Credit Card Balance</span>
                  </label>
                  <Input
                    type="number"
                    id="balance"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    placeholder="5,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Total amount of debt on your card
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Annual Interest Rate (APR)</span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder="18.99"
                    step="0.01"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Interest rate you pay on this card
                  </p>
                </div>
              </div>

              {/* Payment Approach Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <span>Choose Your Payment Approach</span>
                </h3>
                
                <RadioGroup
                  value={formData.paymentApproach}
                  onValueChange={handleRadioChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly-payment" id="monthly-payment" />
                    <Label htmlFor="monthly-payment" className="text-sm font-medium text-gray-700">
                      I know my monthly payment amount
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payoff-timeline" id="payoff-timeline" />
                    <Label htmlFor="payoff-timeline" className="text-sm font-medium text-gray-700">
                      I want to pay off in a specific time
                    </Label>
                  </div>
                </RadioGroup>

                {/* Conditional Fields */}
                {formData.paymentApproach === "monthly-payment" ? (
                  <div className="space-y-3">
                    <label
                      htmlFor="monthlyPayment"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Monthly Payment Amount</span>
                    </label>
                    <Input
                      type="number"
                      id="monthlyPayment"
                      name="monthlyPayment"
                      value={formData.monthlyPayment}
                      onChange={handleInputChange}
                      placeholder="200"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      Fixed amount you plan to pay each month
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="payoffMonths"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Desired Payoff Timeline</span>
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        id="payoffMonths"
                        name="payoffMonths"
                        value={formData.payoffMonths}
                        onChange={handleInputChange}
                        placeholder="24"
                        className="flex-1 h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                      />
                      <Select
                        onValueChange={(value) => handleSelectChange("payoffMonths", value)}
                        defaultValue="months"
                      >
                        <SelectTrigger className="w-28 !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500">
                      Number of months (or years) in which you want to pay off the debt
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculatePayoff}
                  disabled={!isFormValid()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Payoff Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingDown className="w-6 h-6 text-yellow-300" />
                <span>Your Payoff Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-red-600" />
                      <h3 className="font-semibold text-red-800">Months to Payoff</h3>
                    </div>
                    <div className="text-2xl font-bold text-red-900">
                      {results.monthsToPayoff === 999 ? "∞" : results.monthsToPayoff}
                    </div>
                    <div className="text-sm text-red-600">
                      {results.monthsToPayoff === 999 ? "Never (payment too low)" : "Time to debt freedom"}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Monthly Payment</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.requiredMonthlyPayment)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {formData.paymentApproach === "monthly-payment" ? "Your planned payment" : "Required to meet timeline"}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Percent className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">Total Interest</h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.totalInterest)}
                    </div>
                    <div className="text-sm text-orange-600">
                      Interest cost over the payoff period
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Total Cost</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(results.totalCost)}
                    </div>
                    <div className="text-sm text-purple-600">
                      Balance + interest
                    </div>
                  </div>
                </div>

                {/* Payoff Timeline */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span>Payoff Timeline</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Estimated Payoff Date</h4>
                        <div className="text-xl font-bold text-green-600">{results.payoffDate}</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2">Potential Savings</h4>
                        <div className="text-xl font-bold text-blue-600">
                          {results.savings === "0" ? "N/A" : formatCurrency(results.savings)}
                        </div>
                        <div className="text-xs text-blue-600">
                          vs. minimum payment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payoff Progress Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span>Balance Reduction Over Time</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.projectedPayoff}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
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
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stackId="1"
                          stroke="#ef4444" 
                          fill="#ef4444"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <span>Monthly Payment Breakdown</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projectedPayoff}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Amount']}
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="payment" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          name="Total Payment"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="principal" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          name="Principal"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interest" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="Interest"
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
