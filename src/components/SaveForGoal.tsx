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
  Gift,
  Loader2,
} from "lucide-react";
import { SaveForGoalForm, SaveForGoalResults } from "@/interfaces/save-for-goal";

export default function SaveForGoal() {
  const t = useTranslations();
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
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGoal = () => {
    // Show loading state and notification
    setIsCalculating(true);
    toast.loading(t("saveForGoal.toasts.calculating"), {
      id: "save-for-goal-calculation",
    });

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
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
            monthlyContribution = contributionAmount * 2.17;
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

        projectedGrowth.push({
          month: 0,
          balance: totalAvailable.toFixed(2),
          contribution: "0.00",
          interest: "0.00",
        });

        if (targetTimeline > 0) {
          const timelineMonths =
            formData.timelineUnit === "years"
              ? targetTimeline * 12
              : targetTimeline;

          for (let month = 1; month <= timelineMonths; month++) {
            const monthStartBalance = projectedBalance;
            projectedBalance =
              monthStartBalance * (1 + monthlyInterestRate) +
              monthlyContribution;
            totalContributed += monthlyContribution;
            interestEarned +=
              projectedBalance - monthStartBalance - monthlyContribution;

            if (month % 12 === 0) {
              projectedGrowth.push({
                month: month,
                balance: projectedBalance.toFixed(2),
                contribution: (monthlyContribution * 12).toFixed(2),
                interest: (
                  projectedBalance -
                  monthStartBalance -
                  monthlyContribution * 12
                ).toFixed(2),
              });
            }
          }

          monthsToGoal = timelineMonths;
        } else {
          let month = 0;
          while (projectedBalance < goalAmount && month < 600) {
            month++;
            const monthStartBalance = projectedBalance;
            projectedBalance =
              monthStartBalance * (1 + monthlyInterestRate) +
              monthlyContribution;
            totalContributed += monthlyContribution;
            interestEarned +=
              projectedBalance - monthStartBalance - monthlyContribution;

            if (month % 12 === 0) {
              projectedGrowth.push({
                month: month,
                balance: projectedBalance.toFixed(2),
                contribution: (monthlyContribution * 12).toFixed(2),
                interest: (
                  projectedBalance -
                  monthStartBalance -
                  monthlyContribution * 12
                ).toFixed(2),
              });
            }
          }

          monthsToGoal = month;
        }

        const yearsToGoal = monthsToGoal / 12;

        let requiredMonthly = 0;
        if (targetTimeline > 0 && monthlyInterestRate > 0) {
          const timelineMonths =
            formData.timelineUnit === "years"
              ? targetTimeline * 12
              : targetTimeline;
          requiredMonthly =
            (goalAmount -
              totalAvailable *
                Math.pow(1 + monthlyInterestRate, timelineMonths)) /
            ((Math.pow(1 + monthlyInterestRate, timelineMonths) - 1) /
              monthlyInterestRate);
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

        if (achievable) {
          toast.success(t("saveForGoal.toasts.goalAchievable"), {
            description: t("saveForGoal.toasts.youCanReachGoal"),
          });
        } else {
          toast.warning(t("saveForGoal.toasts.goalNotAchievable"), {
            description: t("saveForGoal.toasts.considerAdjustingPlan"),
          });
        }
      } catch (error) {
        toast.error(t("saveForGoal.toasts.calculationFailed"), {
          id: "save-for-goal-calculation",
          description: t("saveForGoal.toasts.checkInputsAndRetry"),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("save-for-goal-calculation");
      }
    }, 800);
  };

  const isFormValid = () => {
    return (
      formData.goalAmount &&
      formData.currentSavings &&
      formData.contributionAmount
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
      title={t("saveForGoal.title")}
      description={t("saveForGoal.description")}
      icon={<Target className="w-6 h-6 text-purple-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-purple-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>{t("saveForGoal.requiredInformation.title")}</span>
            </CardTitle>
            <p className="text-purple-100 text-sm font-normal mt-1">
              {t("saveForGoal.requiredInformation.description")}
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
                    <span>
                      {t("saveForGoal.requiredInformation.goalAmount.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="goalAmount"
                    name="goalAmount"
                    value={formData.goalAmount}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveForGoal.requiredInformation.goalAmount.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveForGoal.requiredInformation.goalAmount.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="currentSavings"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveForGoal.requiredInformation.currentSavings.label"
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
                      "saveForGoal.requiredInformation.currentSavings.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveForGoal.requiredInformation.currentSavings.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="otherIncome"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      {t("saveForGoal.requiredInformation.otherIncome.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="otherIncome"
                    name="otherIncome"
                    value={formData.otherIncome}
                    onChange={handleInputChange}
                    placeholder={t(
                      "saveForGoal.requiredInformation.otherIncome.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("saveForGoal.requiredInformation.otherIncome.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionAmount"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveForGoal.requiredInformation.contributionAmount.label"
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
                      "saveForGoal.requiredInformation.contributionAmount.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveForGoal.requiredInformation.contributionAmount.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="contributionFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveForGoal.requiredInformation.contributionFrequency.label"
                      )}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("contributionFrequency", value)
                    }
                    defaultValue={formData.contributionFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "saveForGoal.requiredInformation.contributionFrequency.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">
                        {t(
                          "saveForGoal.requiredInformation.contributionFrequency.options.weekly"
                        )}
                      </SelectItem>
                      <SelectItem value="biweekly">
                        {t(
                          "saveForGoal.requiredInformation.contributionFrequency.options.biweekly"
                        )}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "saveForGoal.requiredInformation.contributionFrequency.options.monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t(
                          "saveForGoal.requiredInformation.contributionFrequency.options.quarterly"
                        )}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t(
                          "saveForGoal.requiredInformation.contributionFrequency.options.yearly"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveForGoal.requiredInformation.contributionFrequency.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveForGoal.requiredInformation.annualInterestRate.label"
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
                      "saveForGoal.requiredInformation.annualInterestRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "saveForGoal.requiredInformation.annualInterestRate.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="targetTimeline"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      {t(
                        "saveForGoal.requiredInformation.targetTimeline.label"
                      )}
                    </span>
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      id="targetTimeline"
                      name="targetTimeline"
                      value={formData.targetTimeline}
                      onChange={handleInputChange}
                      placeholder={t(
                        "saveForGoal.requiredInformation.targetTimeline.placeholder"
                      )}
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
                        <SelectItem value="months">
                          {t(
                            "saveForGoal.requiredInformation.targetTimeline.units.months"
                          )}
                        </SelectItem>
                        <SelectItem value="years">
                          {t(
                            "saveForGoal.requiredInformation.targetTimeline.units.years"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("saveForGoal.requiredInformation.targetTimeline.help")}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculateGoal}
                  disabled={!isFormValid() || isCalculating}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("saveForGoal.calculatingButton")}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t("saveForGoal.calculateButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="py-0 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingUp className="w-6 h-6 text-yellow-300" />
                <span>
                  {t("saveForGoal.results.title", {
                    goal: formatCurrency(formData.goalAmount),
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">
                        {t("saveForGoal.results.timeToGoal")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {results.yearsToGoal} {t("saveForGoal.results.years")}
                    </div>
                    <div className="text-sm text-purple-600">
                      {results.monthsToGoal} {t("saveForGoal.results.months")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Gift className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">
                        {t("saveForGoal.results.currentGap")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.shortfall)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {t("saveForGoal.results.stillNeedToSave")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <PiggyBank className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">
                        {t("saveForGoal.results.totalContributed")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(results.totalContributed)}
                    </div>
                    <div className="text-sm text-green-600">
                      {t("saveForGoal.results.overYears", {
                        years: results.yearsToGoal,
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">
                        {t("saveForGoal.results.finalBalance")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.projectedBalance)}
                    </div>
                    <div
                      className={`text-sm px-2 py-1 rounded-full ${
                        results.achievable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {results.achievable
                        ? t("saveForGoal.results.goalAchieved")
                        : t("saveForGoal.results.belowGoal")}
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>{t("saveForGoal.results.projectedGrowth")}</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projectedGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="month"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value === 0) return "Start";
                            const years = Math.floor(value / 12);
                            const months = value % 12;
                            if (years === 0) return `${months}m`;
                            if (months === 0) return `${years}y`;
                            return `${years}y ${months}m`;
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
                            t("saveForGoal.results.balanceLabel"),
                          ]}
                          labelFormatter={(label) => {
                            if (label === 0) return "Starting Balance";
                            const years = Math.floor(label / 12);
                            const months = label % 12;
                            if (years === 0)
                              return t("saveForGoal.results.monthLabel", {
                                month: months,
                              });
                            if (months === 0) return `${years}y`;
                            return `${years}y ${months}m`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
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
                      <span>
                        {t("saveForGoal.results.requiredMonthlyContribution")}
                      </span>
                    </h4>
                    <div className="pt-3">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {formData.targetTimeline
                          ? formatCurrency(results.requiredMonthly)
                          : "N/A"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.targetTimeline
                          ? t("saveForGoal.results.toReachGoalInTimeline", {
                              goal: formatCurrency(formData.goalAmount),
                              timeline: formData.targetTimeline,
                              unit:
                                formData.timelineUnit === "years"
                                  ? t("saveForGoal.results.years")
                                  : t("saveForGoal.results.months"),
                            })
                          : t("saveForGoal.results.setTargetTimeline")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-blue-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{t("saveForGoal.results.timelineSummary")}</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveForGoal.results.goalAmount")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(formData.goalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveForGoal.results.currentSavings")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(formData.currentSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveForGoal.results.otherIncome")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(formData.otherIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">
                          {t("saveForGoal.results.timeToGoal")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {results.yearsToGoal} {t("saveForGoal.results.years")}
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
