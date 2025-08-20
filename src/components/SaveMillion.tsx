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
} from "recharts";
import CalculatorLayout from "./CalculatorLayout";
import { toast } from "sonner";
import {
  Target,
  Calculator,
  DollarSign,
  Calendar,
  PiggyBank,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { SaveMillionForm, SaveMillionResults } from "@/interfaces/save-million";

export default function SaveMillion() {
  const t = useTranslations();

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
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSavings = () => {
    // Show loading state and notification
    setIsCalculating(true);
    toast.loading(t("saveMillion.toasts.calculating"), {
      id: "save-million-calculation",
    });

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
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

        // Add the starting point (current age with current savings, no interest yet)
        projectedGrowth.push({
          year: currentAge,
          balance: currentSavings.toFixed(2),
          contribution: "0.00",
          interest: "0.00",
        });

        for (let year = 1; year <= yearsToGoal; year++) {
          let yearContribution = 0;
          let yearInterest = 0;

          for (let month = 1; month <= 12; month++) {
            const monthStartBalance = futureValue;
            futureValue =
              monthStartBalance * (1 + monthlyInterestRate) +
              monthlyContribution;
            yearContribution += monthlyContribution;
            yearInterest +=
              futureValue - monthStartBalance - monthlyContribution;
          }

          projectedGrowth.push({
            year: currentAge + year,
            balance: futureValue.toFixed(2),
            contribution: yearContribution.toFixed(2),
            interest: yearInterest.toFixed(2),
          });
        }

        const totalContributed = (monthlyContribution * monthsToGoal).toFixed(
          2
        );
        const interestEarned = (
          futureValue -
          currentSavings -
          parseFloat(totalContributed)
        ).toFixed(2);

        let requiredMonthly = 0;
        if (yearsToGoal > 0 && monthlyInterestRate > 0) {
          requiredMonthly =
            (savingsGoal -
              currentSavings *
                Math.pow(1 + monthlyInterestRate, monthsToGoal)) /
            ((Math.pow(1 + monthlyInterestRate, monthsToGoal) - 1) /
              monthlyInterestRate);
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

        if (achievable) {
          toast.success(t("saveMillion.toasts.goalAchievable"), {
            description: t("saveMillion.toasts.youCanReachGoal"),
          });
        } else {
          toast.warning(t("saveMillion.toasts.goalNotAchievable"), {
            description: t(
              "saveMillion.toasts.considerIncreasingContributions"
            ),
          });
        }
      } catch (error) {
        toast.error(t("saveMillion.toasts.calculationFailed"), {
          id: "save-million-calculation",
          description: t("saveMillion.toasts.checkInputsAndRetry"),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("save-million-calculation");
      }
    }, 800);
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
    return parseFloat(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <CalculatorLayout
      title={t("saveMillion.title")}
      description={t("saveMillion.description")}
      icon={<Target className="w-6 h-6 text-green-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-green-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>{t("saveMillion.requiredInformation.title")}</span>
            </CardTitle>
            <p className="text-green-100 text-sm font-normal mt-1">
              {t("saveMillion.requiredInformation.description")}
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
                    <span>
                      {t("saveMillion.requiredInformation.savingsGoal.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="savingsGoal"
                    name="savingsGoal"
                    value={formData.savingsGoal}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveMillion.requiredInformation.savingsGoal.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveMillion.requiredInformation.savingsGoal.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentAge"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      {t("saveMillion.requiredInformation.currentAge.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="currentAge"
                    name="currentAge"
                    value={formData.currentAge}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveMillion.requiredInformation.currentAge.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveMillion.requiredInformation.currentAge.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="targetAge"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>
                      {t("saveMillion.requiredInformation.targetAge.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="targetAge"
                    name="targetAge"
                    value={formData.targetAge}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveMillion.requiredInformation.targetAge.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveMillion.requiredInformation.targetAge.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentSavings"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveMillion.requiredInformation.currentSavings.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="currentSavings"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveMillion.requiredInformation.currentSavings.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveMillion.requiredInformation.currentSavings.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveMillion.requiredInformation.contributionAmount.label"
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
                      "saveMillion.requiredInformation.contributionAmount.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveMillion.requiredInformation.contributionAmount.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveMillion.requiredInformation.contributionFrequency.label"
                      )}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "saveMillion.requiredInformation.contributionFrequency.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">
                        {t(
                          "saveMillion.requiredInformation.contributionFrequency.options.weekly"
                        )}
                      </SelectItem>
                      <SelectItem value="biweekly">
                        {t(
                          "saveMillion.requiredInformation.contributionFrequency.options.biweekly"
                        )}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "saveMillion.requiredInformation.contributionFrequency.options.monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t(
                          "saveMillion.requiredInformation.contributionFrequency.options.quarterly"
                        )}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t(
                          "saveMillion.requiredInformation.contributionFrequency.options.yearly"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveMillion.requiredInformation.contributionFrequency.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveMillion.requiredInformation.annualInterestRate.label"
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
                      "saveMillion.requiredInformation.annualInterestRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveMillion.requiredInformation.annualInterestRate.help"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateSavings}
                  disabled={!isFormValid() || isCalculating}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("saveMillion.calculatingButton")}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t("saveMillion.calculateButton")}
                    </>
                  )}
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
                <span>
                  {t("saveMillion.results.title", {
                    goal: formatCurrency(formData.savingsGoal),
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">
                        {t("saveMillion.results.timeToGoal")}
                      </h3>
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
                      <h3 className="font-semibold text-blue-800">
                        {t("saveMillion.results.totalContributed")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.totalContributed)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {t("saveMillion.results.overYears", {
                        years: results.yearsToGoal,
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">
                        {t("saveMillion.results.interestEarned")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(results.interestEarned)}
                    </div>
                    <div className="text-sm text-purple-600">
                      {t("saveMillion.results.compoundGrowth")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">
                        {t("saveMillion.results.finalBalance")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.finalBalance)}
                    </div>
                    <div
                      className={`text-sm px-2 py-1 rounded-full ${
                        results.achievable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {results.achievable
                        ? t("saveMillion.results.goalAchieved")
                        : t("saveMillion.results.belowGoal")}
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>{t("saveMillion.results.projectedGrowth")}</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
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
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value.toString()),
                          t("saveMillion.results.balanceLabel"),
                        ]}
                        labelFormatter={(label) =>
                          t("saveMillion.results.ageLabel", { age: label })
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-green-200 pb-2 flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-green-600" />
                      <span>
                        {t("saveMillion.results.requiredMonthlyContribution")}
                      </span>
                    </h4>
                    <div className="pt-3">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(results.monthlyContributionNeeded)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("saveMillion.results.toReachGoal", {
                          goal: formatCurrency(formData.savingsGoal),
                          age: formData.targetAge,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{t("saveMillion.results.timelineSummary")}</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveMillion.results.startAge")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.currentAge}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveMillion.results.targetAge")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.targetAge}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveMillion.results.yearsToGoal")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {results.yearsToGoal}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveMillion.results.monthsToGoal")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {results.monthsToGoal}
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
