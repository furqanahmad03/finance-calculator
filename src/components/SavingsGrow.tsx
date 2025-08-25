"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { toast } from "sonner";
import {
  TrendingUp,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  PiggyBank,
  BarChart3,
  Loader2,
} from "lucide-react";
import { SavingsGrowForm, SavingsGrowResults } from "@/interfaces/savings-grow";

export default function SavingsGrow() {
  const t = useTranslations();
  const [formData, setFormData] = useState<SavingsGrowForm>({
    initialBalance: "",
    annualInterestRate: "",
    contributionAmount: "",
    contributionFrequency: "yearly",
    years: "",
    compoundingFrequency: "monthly",
  });

  const [results, setResults] = useState<SavingsGrowResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGrowth = () => {
    // Show loading state and notification
    setIsCalculating(true);
    toast.loading(t("savingsGrow.toasts.calculating"), {
      id: "savings-grow-calculation",
    });

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
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
        const periodicInterestRate =
          annualInterestRate / 100 / compoundingPeriodsPerYear;

        // Calculate periodic contribution
        const periodicContribution =
          contributionAmount / contributionMultiplier;

        let currentBalance = initialBalance;
        const growthChart = [];
        let totalContributed = 0;
        let totalInterest = 0;

        // Add the starting point (initial balance, no interest yet)
        growthChart.push({
          year: 0,
          balance: initialBalance.toFixed(2),
          contribution: "0.00",
          interest: "0.00",
          totalContributed: "0.00",
        });

        // Calculate growth year by year
        for (let year = 1; year <= years; year++) {
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
            yearInterest +=
              currentBalance - periodStartBalance - periodicContribution;
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
        const growthPercentage =
          ((finalBalance - initialBalance) / initialBalance) * 100;

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

        // Show success toast
        toast.success(t("savingsGrow.toasts.calculationCompleted"), {
          description: t("savingsGrow.toasts.growthProjectionReady"),
        });
      } catch (error) {
        toast.error(t("savingsGrow.toasts.calculationFailed"), {
          id: "savings-grow-calculation",
          description: t("savingsGrow.toasts.checkInputsAndRetry"),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("savings-grow-calculation");
      }
    }, 800);
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
    return parseFloat(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPercentage = (value: string) => {
    return `${parseFloat(value).toFixed(2)}%`;
  };

  return (
    <CalculatorLayout
      title={t("savingsGrow.title")}
      description={t("savingsGrow.description")}
      icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-emerald-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-emerald-600 to-emerald-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>{t("savingsGrow.requiredInformation.title")}</span>
            </CardTitle>
            <p className="text-emerald-100 text-sm font-normal mt-1">
              {t("savingsGrow.requiredInformation.description")}
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
                    <span>
                      {t(
                        "savingsGrow.requiredInformation.initialBalance.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="initialBalance"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleInputChange}
                    placeholder={t(
                      "savingsGrow.requiredInformation.initialBalance.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("savingsGrow.requiredInformation.initialBalance.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      {t(
                        "savingsGrow.requiredInformation.annualInterestRate.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder={t(
                      "savingsGrow.requiredInformation.annualInterestRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "savingsGrow.requiredInformation.annualInterestRate.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>
                      {t(
                        "savingsGrow.requiredInformation.contributionAmount.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="contributionAmount"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    placeholder={t(
                      "savingsGrow.requiredInformation.contributionAmount.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "savingsGrow.requiredInformation.contributionAmount.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>
                      {t(
                        "savingsGrow.requiredInformation.contributionFrequency.label"
                      )}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "savingsGrow.requiredInformation.contributionFrequency.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">
                        {t(
                          "savingsGrow.requiredInformation.contributionFrequency.options.weekly"
                        )}
                      </SelectItem>
                      <SelectItem value="biweekly">
                        {t(
                          "savingsGrow.requiredInformation.contributionFrequency.options.biweekly"
                        )}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "savingsGrow.requiredInformation.contributionFrequency.options.monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t(
                          "savingsGrow.requiredInformation.contributionFrequency.options.quarterly"
                        )}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t(
                          "savingsGrow.requiredInformation.contributionFrequency.options.yearly"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t(
                      "savingsGrow.requiredInformation.contributionFrequency.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="years"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      {t("savingsGrow.requiredInformation.years.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="years"
                    name="years"
                    value={formData.years}
                    onChange={handleInputChange}
                    placeholder={t(
                      "savingsGrow.requiredInformation.years.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("savingsGrow.requiredInformation.years.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="compoundingFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      {t(
                        "savingsGrow.requiredInformation.compoundingFrequency.label"
                      )}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("compoundingFrequency", value)
                    }
                    defaultValue={formData.compoundingFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "savingsGrow.requiredInformation.compoundingFrequency.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        {t(
                          "savingsGrow.requiredInformation.compoundingFrequency.options.daily"
                        )}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "savingsGrow.requiredInformation.compoundingFrequency.options.monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t(
                          "savingsGrow.requiredInformation.compoundingFrequency.options.quarterly"
                        )}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t(
                          "savingsGrow.requiredInformation.compoundingFrequency.options.yearly"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t(
                      "savingsGrow.requiredInformation.compoundingFrequency.help"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateGrowth}
                  disabled={!isFormValid() || isCalculating}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("savingsGrow.calculatingButton")}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t("savingsGrow.calculateButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="py-0 border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-emerald-600 to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingUp className="w-6 h-6 text-yellow-300" />
                <span>{t("savingsGrow.results.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">
                        {t("savingsGrow.results.finalBalance")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(results.finalBalance)}
                    </div>
                    <div className="text-sm text-emerald-600">
                      {t("savingsGrow.results.afterYears", {
                        years: formData.years,
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">
                        {t("savingsGrow.results.totalContributed")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.totalContributed)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {t("savingsGrow.results.regularContributions")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">
                        {t("savingsGrow.results.interestEarned")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(results.interestEarned)}
                    </div>
                    <div className="text-sm text-purple-600">
                      {t("savingsGrow.results.compoundGrowth")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Percent className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">
                        {t("savingsGrow.results.growthPercentage")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatPercentage(results.breakdown.growthPercentage)}
                    </div>
                    <div className="text-sm text-orange-600">
                      {t("savingsGrow.results.totalReturn")}
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>
                      {t("savingsGrow.results.savingsGrowthOverTime")}
                    </span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.growthChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="year"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value === 0) return "Start";
                            return `${value}y`;
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `$${(value / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          formatter={(value: string | number) => [
                            formatCurrency(value.toString()),
                            t("savingsGrow.results.balanceLabel"),
                          ]}
                          labelFormatter={(label) => {
                            if (label === 0) return "Starting Balance";
                            return t("savingsGrow.results.yearLabel", {
                              year: label,
                            });
                          }}
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
                    <span>
                      {t("savingsGrow.results.breakdownOfFinalBalance")}
                    </span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.growthChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="year"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value === 0) return "Start";
                            return `${value}y`;
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `$${(value / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          formatter={(value: string | number, name: string) => {
                            // Custom formatter to show specific names for each line
                            if (name === "totalContributed") {
                              return [
                                formatCurrency(value.toString()),
                                t("savingsGrow.results.totalContributed"),
                              ];
                            } else if (name === "interest") {
                              return [
                                formatCurrency(value.toString()),
                                t("savingsGrow.results.interestEarned"),
                              ];
                            }
                            return [formatCurrency(value.toString()), name];
                          }}
                          labelFormatter={(label) => {
                            if (label === 0) return "Starting Balance";
                            return t("savingsGrow.results.yearLabel", {
                              year: label,
                            });
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalContributed"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          name={t("savingsGrow.results.totalContributed")}
                        />
                        <Line
                          type="monotone"
                          dataKey="interest"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                          name={t("savingsGrow.results.interestEarned")}
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
                      <span>{t("savingsGrow.results.growthBreakdown")}</span>
                    </h4>
                    <div className="pt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.initialAmount")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.breakdown.initialAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.contributions")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.breakdown.contributionsTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.interestEarnedLabel")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.breakdown.interestTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.growthPercent")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPercentage(results.breakdown.growthPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{t("savingsGrow.results.projectionSummary")}</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.timePeriod")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.years} {t("savingsGrow.results.years")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.contributionFrequency")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.contributionFrequency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.compounding")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.compoundingFrequency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("savingsGrow.results.annualRate")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.annualInterestRate}%
                        </span>
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
