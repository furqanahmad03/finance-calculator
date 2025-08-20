"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CalculatorLayout from "./CalculatorLayout";
import {
  Car,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  CreditCard,
  PiggyBank,
} from "lucide-react";

interface CarCalculatorForm {
  // Required Fields
  downPayment: string;
  tradeInValue: string;
  outstandingLoanBalance: string;
  loanTerm: string;
  interestRate: string;
  salesTaxRate: string;
  monthlyPaymentBudget: string;

  // Optional Fields
  dealerRebates: string;
  additionalFees: string;
  desiredPayoffHorizon: string;
  incomeGuidelinePercentage: string;

  // Vehicle Details
  carPrice: string;
}

interface CarCalculatorResults {
  monthlyPayment: string;
  totalPayment: string;
  totalInterest: string;
  loanAmount: string;
  downPaymentAmount: string;
  tradeInNetValue: string;
  totalCost: string;
  affordabilityCheck: string;
  recommendedBudget: string;
}

export default function CarCalculator() {
  const [formData, setFormData] = useState<CarCalculatorForm>({
    downPayment: "",
    tradeInValue: "",
    outstandingLoanBalance: "",
    loanTerm: "",
    interestRate: "",
    salesTaxRate: "",
    monthlyPaymentBudget: "",
    dealerRebates: "",
    additionalFees: "",
    desiredPayoffHorizon: "",
    incomeGuidelinePercentage: "",
    carPrice: "",
  });

  const [results, setResults] = useState<CarCalculatorResults | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateLoan = () => {
    // Parse required fields
    const downPayment = parseFloat(formData.downPayment) || 0;
    const tradeInValue = parseFloat(formData.tradeInValue) || 0;
    const outstandingLoanBalance = parseFloat(formData.outstandingLoanBalance) || 0;
    const loanTerm = parseFloat(formData.loanTerm) || 0;
    const interestRate = parseFloat(formData.interestRate) || 0;
    const salesTaxRate = parseFloat(formData.salesTaxRate) || 0;
    const monthlyPaymentBudget = parseFloat(formData.monthlyPaymentBudget) || 0;

    // Parse optional fields
    const dealerRebates = parseFloat(formData.dealerRebates) || 0;
    const additionalFees = parseFloat(formData.additionalFees) || 0;
    const desiredPayoffHorizon = parseFloat(formData.desiredPayoffHorizon) || loanTerm;
    const incomeGuidelinePercentage = parseFloat(formData.incomeGuidelinePercentage) || 15;

    // Calculate net trade-in value
    const tradeInNetValue = tradeInValue - outstandingLoanBalance;

    // Calculate effective down payment (including trade-in net value)
    const effectiveDownPayment = downPayment + tradeInNetValue;

    // Calculate loan amount (assuming car price is derived from down payment + trade-in + loan)
    const estimatedCarPrice = effectiveDownPayment + monthlyPaymentBudget * loanTerm * 12;
    const loanAmount = estimatedCarPrice - effectiveDownPayment;

    // Calculate sales tax
    const salesTax = (estimatedCarPrice - tradeInValue) * (salesTaxRate / 100);

    // Calculate total cost including fees
    const totalCost = estimatedCarPrice + salesTax + additionalFees - dealerRebates;

    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    let monthlyPayment = 0;
    if (numberOfPayments > 0 && monthlyRate > 0) {
      monthlyPayment =
        (loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    // Affordability check
    const affordabilityCheck =
      monthlyPayment <= monthlyPaymentBudget ? "Affordable" : "Over Budget";
    const recommendedBudget = (monthlyPaymentBudget * 0.8).toFixed(2); // 20% buffer

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      loanAmount: loanAmount.toFixed(2),
      downPaymentAmount: effectiveDownPayment.toFixed(2),
      tradeInNetValue: tradeInNetValue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      affordabilityCheck,
      recommendedBudget,
    });
  };

  const isFormValid = () => {
    return (
      formData.downPayment &&
      formData.tradeInValue &&
      formData.outstandingLoanBalance &&
      formData.loanTerm &&
      formData.interestRate &&
      formData.salesTaxRate &&
      formData.monthlyPaymentBudget
    );
  };

  return (
    <CalculatorLayout
      title="Car Loan Calculator"
      description="Calculate car loan payments, affordability, and total cost with trade-in considerations"
      icon={<Car className="w-6 h-6 text-blue-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>Required Information</span>
            </CardTitle>
            <p className="text-blue-100 text-sm font-normal mt-1">
              Fill in these essential details to calculate your car loan
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="downPayment"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Down Payment Amount</span>
                  </label>
                  <Input
                    type="number"
                    id="downPayment"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    placeholder="5,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Cash you have saved for the purchase
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="tradeInValue"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Trade-in Value</span>
                  </label>
                  <Input
                    type="number"
                    id="tradeInValue"
                    name="tradeInValue"
                    value={formData.tradeInValue}
                    onChange={handleInputChange}
                    placeholder="8,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    What dealer will pay for your current car
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="outstandingLoanBalance"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Outstanding Loan Balance</span>
                  </label>
                  <Input
                    type="number"
                    id="outstandingLoanBalance"
                    name="outstandingLoanBalance"
                    value={formData.outstandingLoanBalance}
                    onChange={handleInputChange}
                    placeholder="3,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Remaining balance on your current car loan
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="loanTerm"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Loan Term (Years)</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("loanTerm", value)
                    }
                    defaultValue={formData.loanTerm}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year (12 Months)</SelectItem>
                      <SelectItem value="2">2 Years (24 Months)</SelectItem>
                      <SelectItem value="3">3 Years (36 Months)</SelectItem>
                      <SelectItem value="4">4 Years (48 Months)</SelectItem>
                      <SelectItem value="5">5 Years (60 Months)</SelectItem>
                      <SelectItem value="6">6 Years (72 Months)</SelectItem>
                      <SelectItem value="7">7 Years (84 Months)</SelectItem>
                      <SelectItem value="8">8 Years (96 Months)</SelectItem>
                      <SelectItem value="9">9 Years (108 Months)</SelectItem>
                      <SelectItem value="10">10 Years (120 Months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="interestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Interest Rate (APR %)</span>
                  </label>
                  <Input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    placeholder="6.5"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Annual percentage rate you expect
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="salesTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Sales Tax Rate (%)</span>
                  </label>
                  <Input
                    type="number"
                    id="salesTaxRate"
                    name="salesTaxRate"
                    value={formData.salesTaxRate}
                    onChange={handleInputChange}
                    placeholder="8.25"
                    step="0.01"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Tax rate in your county/state
                  </p>
                </div>

                <div className="space-y-3 lg:col-span-2">
                  <label
                    htmlFor="monthlyPaymentBudget"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Monthly Payment Budget</span>
                  </label>
                  <Input
                    type="number"
                    id="monthlyPaymentBudget"
                    name="monthlyPaymentBudget"
                    value={formData.monthlyPaymentBudget}
                    onChange={handleInputChange}
                    placeholder="400"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum monthly payment you can afford
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Fields Toggle */}
        <div className="flex items-center justify-center">
          <div
            className="flex items-center space-x-3 bg-white p-4 rounded-sm shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 cursor-pointer"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
          >
            <Checkbox
              id="showOptional"
              checked={showOptionalFields}
              onCheckedChange={(checked) =>
                setShowOptionalFields(checked as boolean)
              }
              className="w-5 h-5"
            />
            <label
              htmlFor="showOptional"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Show Advanced Options for More Accuracy
            </label>
            <div
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                showOptionalFields ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>

        {/* Optional Fields */}
        {showOptionalFields && (
          <Card className="border-0 py-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Calculator className="w-6 h-6 text-yellow-300" />
                <span>Advanced Options</span>
              </CardTitle>
              <p className="text-purple-100 text-sm font-normal mt-1">
                Additional fields for enhanced accuracy and flexibility
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label
                      htmlFor="dealerRebates"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span>Dealer/Manufacturer Rebates</span>
                    </label>
                    <Input
                      type="number"
                      id="dealerRebates"
                      name="dealerRebates"
                      value={formData.dealerRebates}
                      onChange={handleInputChange}
                      placeholder="1,000"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      Manufacturer incentives and rebates
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="additionalFees"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Additional Fees</span>
                    </label>
                    <Input
                      type="number"
                      id="additionalFees"
                      name="additionalFees"
                      value={formData.additionalFees}
                      onChange={handleInputChange}
                      placeholder="500"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      Registration, documentation, title fees
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="desiredPayoffHorizon"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Desired Payoff Horizon</span>
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("desiredPayoffHorizon", value)
                      }
                      defaultValue={formData.desiredPayoffHorizon}
                    >
                      <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium">
                        <SelectValue placeholder="Select payoff horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year (12 Months)</SelectItem>
                        <SelectItem value="2">2 Years (24 Months)</SelectItem>
                        <SelectItem value="3">3 Years (36 Months)</SelectItem>
                        <SelectItem value="4">4 Years (48 Months)</SelectItem>
                        <SelectItem value="5">5 Years (60 Months)</SelectItem>
                        <SelectItem value="6">6 Years (72 Months)</SelectItem>
                        <SelectItem value="7">7 Years (84 Months)</SelectItem>
                        <SelectItem value="8">8 Years (96 Months)</SelectItem>
                        <SelectItem value="9">9 Years (108 Months)</SelectItem>
                        <SelectItem value="10">
                          10 Years (120 Months)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Years to pay off (if shorter than loan term)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="incomeGuidelinePercentage"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span>Income Guideline Percentage</span>
                    </label>
                    <Input
                      type="number"
                      id="incomeGuidelinePercentage"
                      name="incomeGuidelinePercentage"
                      value={formData.incomeGuidelinePercentage}
                      onChange={handleInputChange}
                      placeholder="15"
                      step="0.1"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      % of monthly take-home pay for car expenses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculate Button */}
        <div className="flex justify-center">
          <Button
            onClick={calculateLoan}
            disabled={!isFormValid()}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-sm shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Calculator className="w-6 h-6 mr-3" />
            Calculate My Car Loan
          </Button>
        </div>

        {/* Results */}
        {results && (
          <Card className="border-0 py-0 shadow-2xl bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <PiggyBank className="w-6 h-6 text-yellow-300" />
                <span>Your Loan Analysis</span>
              </CardTitle>
              <p className="text-green-100 text-sm font-normal mt-1">
                Detailed breakdown of your car financing options
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Pie Chart Section with Right Side Labels */}
                <div className="flex items-start space-x-8">
                  {/* Pie Chart - Larger Size */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 mb-4 flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span>Cost Distribution</span>
                    </h4>

                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            {
                              name: "Loan Amount",
                              value: parseFloat(results.loanAmount),
                              fill: "#3b82f6",
                              percentage: (
                                (parseFloat(results.loanAmount) /
                                  parseFloat(results.totalCost)) *
                                100
                              ).toFixed(1),
                            },
                            {
                              name: "Down Payment",
                              value: parseFloat(results.downPaymentAmount),
                              fill: "#10b981",
                              percentage: (
                                (parseFloat(results.downPaymentAmount) /
                                  parseFloat(results.totalCost)) *
                                100
                              ).toFixed(1),
                            },
                            {
                              name: "Other Costs",
                              value:
                                parseFloat(results.totalCost) -
                                parseFloat(results.loanAmount) -
                                parseFloat(results.downPaymentAmount),
                              fill: "#f59e0b",
                              percentage: (
                                ((parseFloat(results.totalCost) -
                                  parseFloat(results.loanAmount) -
                                  parseFloat(results.downPaymentAmount)) /
                                  parseFloat(results.totalCost)) *
                                100
                              ).toFixed(1),
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          animationDuration={1000}
                          animationBegin={0}
                        >
                          <Cell
                            fill="#3b82f6"
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                          <Cell
                            fill="#10b981"
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                          <Cell
                            fill="#f59e0b"
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                  <div className="font-semibold text-gray-900 mb-1">
                                    {data.name}
                                  </div>
                                  <div className="text-blue-600 font-bold">
                                    ${data.value.toLocaleString()}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {data.percentage}% of total
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right Side Labels - Compact */}
                  <div className="w-48 space-y-4 pt-16">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">
                            Loan Amount
                          </span>
                        </span>
                        <span className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            ${parseFloat(results.loanAmount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            (
                            {(
                              (parseFloat(results.loanAmount) /
                                parseFloat(results.totalCost)) *
                              100
                            ).toFixed(1)}
                            %)
                          </div>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">
                            Down Payment
                          </span>
                        </span>
                        <span className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            $
                            {parseFloat(
                              results.downPaymentAmount
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            (
                            {(
                              (parseFloat(results.downPaymentAmount) /
                                parseFloat(results.totalCost)) *
                              100
                            ).toFixed(1)}
                            %)
                          </div>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">
                            Other Costs
                          </span>
                        </span>
                        <span className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            $
                            {(
                              parseFloat(results.totalCost) -
                              parseFloat(results.loanAmount) -
                              parseFloat(results.downPaymentAmount)
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            (
                            {(
                              ((parseFloat(results.totalCost) -
                                parseFloat(results.loanAmount) -
                                parseFloat(results.downPaymentAmount)) /
                                parseFloat(results.totalCost)) *
                              100
                            ).toFixed(1)}
                            %)
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Other Information Below */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Loan Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span>Loan Details</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Monthly Payment
                        </span>
                        <span className="font-bold text-lg text-blue-600">
                          ${results.monthlyPayment}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Loan Amount
                        </span>
                        <span className="font-bold text-base text-gray-900">
                          ${parseFloat(results.loanAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Total Interest
                        </span>
                        <span className="font-bold text-base text-orange-600">
                          ${parseFloat(results.totalInterest).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Total Payment
                        </span>
                        <span className="font-bold text-base text-purple-600">
                          ${parseFloat(results.totalPayment).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-green-200 pb-2 flex items-center space-x-2">
                      <PiggyBank className="w-4 h-4 text-green-600" />
                      <span>Cost Breakdown</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Down Payment
                        </span>
                        <span className="font-bold text-base text-green-600">
                          $
                          {parseFloat(
                            results.downPaymentAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Trade-in Net Value
                        </span>
                        <span className="font-bold text-base text-teal-600">
                          $
                          {parseFloat(results.tradeInNetValue).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          Total Cost
                        </span>
                        <span className="font-bold text-base text-indigo-600">
                          ${parseFloat(results.totalCost).toLocaleString()}
                        </span>
                      </div>

                      {/* Affordability Section */}
                      <div className="border-t border-gray-200 pt-3 space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                          <span className="text-gray-700 text-sm font-medium">
                            Affordability
                          </span>
                          <span
                            className={`font-bold text-sm px-3 py-1 rounded-full ${
                              results.affordabilityCheck === "Affordable"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {results.affordabilityCheck}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                          <span className="text-gray-700 text-sm font-medium">
                            Recommended Budget
                          </span>
                          <span className="font-bold text-base text-blue-600">
                            ${results.recommendedBudget}
                          </span>
                        </div>
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
