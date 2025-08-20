"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { toast } from "sonner";
import {
  Car,
  Calculator,
  DollarSign,
  PiggyBank,
  Loader2,
} from "lucide-react";
import { CarCalculatorForm, CarCalculatorResults } from "@/interfaces/car-calculator";

export default function CarCalculator() {
  const t = useTranslations();

  const [formData, setFormData] = useState<CarCalculatorForm>({
    carPrice: "",
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
    monthlyIncome: "",
  });

  const [results, setResults] = useState<CarCalculatorResults | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateLoan = () => {
    // Show loading state and notification
    setIsCalculating(true);
    toast.loading(t("carCalculator.toasts.calculating"), {
      id: "car-loan-calculation",
    });

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
        // Parse required fields
        const carPrice = parseFloat(formData.carPrice) || 0;
        const downPayment = parseFloat(formData.downPayment) || 0;
        const tradeInValue = parseFloat(formData.tradeInValue) || 0;
        const outstandingLoanBalance =
          parseFloat(formData.outstandingLoanBalance) || 0;
        const loanTerm = parseFloat(formData.loanTerm) || 0;
        const interestRate = parseFloat(formData.interestRate) || 0;
        const salesTaxRate = parseFloat(formData.salesTaxRate) || 0;
        const monthlyPaymentBudget =
          parseFloat(formData.monthlyPaymentBudget) || 0;

        // Parse optional fields
        const dealerRebates = parseFloat(formData.dealerRebates) || 0;
        const additionalFees = parseFloat(formData.additionalFees) || 0;
        const desiredPayoffHorizon =
          parseFloat(formData.desiredPayoffHorizon) || loanTerm;
        const incomeGuidelinePercentage =
          parseFloat(formData.incomeGuidelinePercentage) || 15;
        const monthlyIncome = parseFloat(formData.monthlyIncome) || 0;

        const tradeInNetValue = tradeInValue - outstandingLoanBalance;
        const effectiveDownPayment = downPayment + tradeInNetValue;
        const loanAmount = carPrice - effectiveDownPayment;

        const salesTax = (carPrice - tradeInValue) * (salesTaxRate / 100);
        const totalCost = carPrice + salesTax + additionalFees - dealerRebates;

        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;
        const desiredNumberOfPayments = desiredPayoffHorizon * 12;

        let monthlyPayment = 0;
        let monthlyPaymentForDesiredHorizon = 0;

        if (numberOfPayments > 0 && monthlyRate > 0) {
          monthlyPayment =
            (loanAmount *
              monthlyRate *
              Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        if (desiredNumberOfPayments > 0 && monthlyRate > 0) {
          monthlyPaymentForDesiredHorizon =
            (loanAmount *
              monthlyRate *
              Math.pow(1 + monthlyRate, desiredNumberOfPayments)) /
            (Math.pow(1 + monthlyRate, desiredNumberOfPayments) - 1);
        }

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;

        const affordabilityCheck =
          monthlyPayment <= monthlyPaymentBudget
            ? t("carCalculator.results.affordable")
            : t("carCalculator.results.overBudget");

        const maxAffordableMonthlyPayment = monthlyPaymentBudget;
        let maxAffordableLoanAmount = 0;

        if (numberOfPayments > 0 && monthlyRate > 0) {
          maxAffordableLoanAmount =
            (maxAffordableMonthlyPayment *
              (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
        }

        const maxAffordableCarPrice =
          maxAffordableLoanAmount + effectiveDownPayment;

        const budgetUtilization =
          monthlyPayment > 0
            ? ((monthlyPayment / monthlyPaymentBudget) * 100).toFixed(1)
            : "0";

        let incomeGuidelineCheck = "Not provided";
        let incomeUtilization = "0";

        if (monthlyIncome > 0) {
          const maxRecommendedPayment =
            monthlyIncome * (incomeGuidelinePercentage / 100);
          const incomeUtilizationPercent =
            (monthlyPayment / monthlyIncome) * 100;

          incomeUtilization = incomeUtilizationPercent.toFixed(1);

          if (monthlyPayment <= maxRecommendedPayment) {
            incomeGuidelineCheck = t("carCalculator.results.withinGuidelines");
          } else {
            incomeGuidelineCheck = t("carCalculator.results.exceedsGuidelines");
          }
        }

        setResults({
          carPrice: carPrice.toFixed(2),
          salesTax: salesTax.toFixed(2),
          monthlyPayment: monthlyPayment.toFixed(2),
          monthlyPaymentForDesiredHorizon:
            monthlyPaymentForDesiredHorizon.toFixed(2),
          totalPayment: totalPayment.toFixed(2),
          totalInterest: totalInterest.toFixed(2),
          loanAmount: loanAmount.toFixed(2),
          downPaymentAmount: effectiveDownPayment.toFixed(2),
          tradeInNetValue: tradeInNetValue.toFixed(2),
          totalCost: totalCost.toFixed(2),
          affordabilityCheck,
          maxAffordableCarPrice: maxAffordableCarPrice.toFixed(2),
          maxAffordableLoanAmount: maxAffordableLoanAmount.toFixed(2),
          budgetUtilization,
          incomeGuidelineCheck,
          incomeUtilization,
        });
        if (monthlyPayment > monthlyPaymentBudget) {
          toast.warning(t("carCalculator.toasts.paymentExceedsBudget"), {
            description: t("carCalculator.toasts.considerLongerTerm"),
          });
        } else {
          toast.success(t("carCalculator.toasts.paymentFitsBudget"), {
            description: t("carCalculator.toasts.canAffordCar"),
          });
        }
      } catch (error) {
        toast.error(t("carCalculator.toasts.calculationFailed"), {
          id: "car-loan-calculation",
          description: t("carCalculator.toasts.checkInputsAndRetry"),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("car-loan-calculation");
      }
    }, 800);
  };

  const isFormValid = () => {
    const isValid =
      formData.carPrice &&
      formData.downPayment &&
      formData.tradeInValue &&
      formData.outstandingLoanBalance &&
      formData.loanTerm &&
      formData.interestRate &&
      formData.salesTaxRate &&
      formData.monthlyPaymentBudget;

    return isValid;
  };

  return (
    <CalculatorLayout
      title={t("carCalculator.title")}
      description={t("carCalculator.description")}
      icon={<Car className="w-6 h-6 text-blue-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>{t("carCalculator.requiredInformation.title")}</span>
            </CardTitle>
            <p className="text-blue-100 text-sm font-normal mt-1">
              {t("carCalculator.requiredInformation.description")}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3 lg:col-span-2">
                  <label
                    htmlFor="carPrice"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      {t("carCalculator.requiredInformation.carPrice.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="carPrice"
                    name="carPrice"
                    value={formData.carPrice}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.carPrice.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.carPrice.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="downPayment"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      {t("carCalculator.requiredInformation.downPayment.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="downPayment"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.downPayment.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.downPayment.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="tradeInValue"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      {t(
                        "carCalculator.requiredInformation.tradeInValue.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="tradeInValue"
                    name="tradeInValue"
                    value={formData.tradeInValue}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.tradeInValue.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.tradeInValue.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="outstandingLoanBalance"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      {t(
                        "carCalculator.requiredInformation.outstandingLoanBalance.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="outstandingLoanBalance"
                    name="outstandingLoanBalance"
                    value={formData.outstandingLoanBalance}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.outstandingLoanBalance.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "carCalculator.requiredInformation.outstandingLoanBalance.help"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="loanTerm"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>
                      {t("carCalculator.requiredInformation.loanTerm.label")}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("loanTerm", value)
                    }
                    defaultValue={formData.loanTerm}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "carCalculator.requiredInformation.loanTerm.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.1"
                        )}
                      </SelectItem>
                      <SelectItem value="2">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.2"
                        )}
                      </SelectItem>
                      <SelectItem value="3">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.3"
                        )}
                      </SelectItem>
                      <SelectItem value="4">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.4"
                        )}
                      </SelectItem>
                      <SelectItem value="5">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.5"
                        )}
                      </SelectItem>
                      <SelectItem value="6">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.6"
                        )}
                      </SelectItem>
                      <SelectItem value="7">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.7"
                        )}
                      </SelectItem>
                      <SelectItem value="8">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.8"
                        )}
                      </SelectItem>
                      <SelectItem value="9">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.9"
                        )}
                      </SelectItem>
                      <SelectItem value="10">
                        {t(
                          "carCalculator.requiredInformation.loanTerm.options.10"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.loanTerm.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="interestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>
                      {t(
                        "carCalculator.requiredInformation.interestRate.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.interestRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.interestRate.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="salesTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      {t(
                        "carCalculator.requiredInformation.salesTaxRate.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="salesTaxRate"
                    name="salesTaxRate"
                    value={formData.salesTaxRate}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.salesTaxRate.placeholder"
                    )}
                    step="0.01"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("carCalculator.requiredInformation.salesTaxRate.help")}
                  </p>
                </div>

                <div className="space-y-3 lg:col-span-2">
                  <label
                    htmlFor="monthlyPaymentBudget"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      {t(
                        "carCalculator.requiredInformation.monthlyPaymentBudget.label"
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="monthlyPaymentBudget"
                    name="monthlyPaymentBudget"
                    value={formData.monthlyPaymentBudget}
                    onChange={handleInputChange}
                    placeholder={t(
                      "carCalculator.requiredInformation.monthlyPaymentBudget.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t(
                      "carCalculator.requiredInformation.monthlyPaymentBudget.help"
                    )}
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
              {t("carCalculator.advancedOptions.showAdvanced")}
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
                <span>{t("carCalculator.advancedOptions.title")}</span>
              </CardTitle>
              <p className="text-purple-100 text-sm font-normal mt-1">
                {t("carCalculator.advancedOptions.description")}
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
                      <span>
                        {t("carCalculator.advancedOptions.dealerRebates.label")}
                      </span>
                    </label>
                    <Input
                      type="number"
                      id="dealerRebates"
                      name="dealerRebates"
                      value={formData.dealerRebates}
                      onChange={handleInputChange}
                      placeholder={t(
                        "carCalculator.advancedOptions.dealerRebates.placeholder"
                      )}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      {t("carCalculator.advancedOptions.dealerRebates.help")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="additionalFees"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>
                        {t(
                          "carCalculator.advancedOptions.additionalFees.label"
                        )}
                      </span>
                    </label>
                    <Input
                      type="number"
                      id="additionalFees"
                      name="additionalFees"
                      value={formData.additionalFees}
                      onChange={handleInputChange}
                      placeholder={t(
                        "carCalculator.advancedOptions.additionalFees.placeholder"
                      )}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      {t("carCalculator.advancedOptions.additionalFees.help")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="desiredPayoffHorizon"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>
                        {t(
                          "carCalculator.advancedOptions.desiredPayoffHorizon.label"
                        )}
                      </span>
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("desiredPayoffHorizon", value)
                      }
                      defaultValue={formData.desiredPayoffHorizon}
                    >
                      <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium">
                        <SelectValue
                          placeholder={t(
                            "carCalculator.advancedOptions.desiredPayoffHorizon.placeholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.1"
                          )}
                        </SelectItem>
                        <SelectItem value="2">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.2"
                          )}
                        </SelectItem>
                        <SelectItem value="3">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.3"
                          )}
                        </SelectItem>
                        <SelectItem value="4">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.4"
                          )}
                        </SelectItem>
                        <SelectItem value="5">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.5"
                          )}
                        </SelectItem>
                        <SelectItem value="6">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.6"
                          )}
                        </SelectItem>
                        <SelectItem value="7">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.7"
                          )}
                        </SelectItem>
                        <SelectItem value="8">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.8"
                          )}
                        </SelectItem>
                        <SelectItem value="9">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.9"
                          )}
                        </SelectItem>
                        <SelectItem value="10">
                          {t(
                            "carCalculator.requiredInformation.loanTerm.options.10"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {t(
                        "carCalculator.advancedOptions.desiredPayoffHorizon.help"
                      )}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="incomeGuidelinePercentage"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span>
                        {t(
                          "carCalculator.advancedOptions.incomeGuidelinePercentage.label"
                        )}
                      </span>
                    </label>
                    <Input
                      type="number"
                      id="incomeGuidelinePercentage"
                      name="incomeGuidelinePercentage"
                      value={formData.incomeGuidelinePercentage}
                      onChange={handleInputChange}
                      placeholder={t(
                        "carCalculator.advancedOptions.incomeGuidelinePercentage.placeholder"
                      )}
                      step="0.1"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      {t(
                        "carCalculator.advancedOptions.incomeGuidelinePercentage.help"
                      )}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="monthlyIncome"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      <span>
                        {t("carCalculator.advancedOptions.monthlyIncome.label")}
                      </span>
                    </label>
                    <Input
                      type="number"
                      id="monthlyIncome"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      placeholder={t(
                        "carCalculator.advancedOptions.monthlyIncome.placeholder"
                      )}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      {t("carCalculator.advancedOptions.monthlyIncome.help")}
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
            disabled={!isFormValid() || isCalculating}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-sm shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-6 h-6 mr-3" />
                {t("carCalculator.calculateButton")}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <Card className="border-0 py-0 shadow-2xl bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <PiggyBank className="w-6 h-6 text-yellow-300" />
                <span>{t("carCalculator.results.title")}</span>
              </CardTitle>
              <p className="text-green-100 text-sm font-normal mt-1">
                {t("carCalculator.results.description")}
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Pie Chart Section with Right Side Labels */}
                <div className="flex flex-col lg:flex-row items-center space-x-8">
                  {/* Pie Chart - Larger Size */}
                  <div className="flex-1 w-full">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 mb-4 flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span>{t("carCalculator.results.costDistribution")}</span>
                    </h4>

                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            {
                              name: t("carCalculator.results.carPrice"),
                              value: parseFloat(results.carPrice),
                              fill: "#3b82f6",
                              percentage: (
                                (parseFloat(results.carPrice) /
                                  parseFloat(results.totalCost)) *
                                100
                              ).toFixed(1),
                            },
                            {
                              name: t("carCalculator.results.downPayment"),
                              value: parseFloat(results.downPaymentAmount),
                              fill: "#10b981",
                              percentage: (
                                (parseFloat(results.downPaymentAmount) /
                                  parseFloat(results.totalCost)) *
                                100
                              ).toFixed(1),
                            },
                            {
                              name: t("carCalculator.results.otherCosts"),
                              value:
                                parseFloat(results.totalCost) -
                                parseFloat(results.carPrice) -
                                parseFloat(results.downPaymentAmount),
                              fill: "#f59e0b",
                              percentage: (
                                ((parseFloat(results.totalCost) -
                                  parseFloat(results.carPrice) -
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
                                    {t(
                                      "carCalculator.results.percentageOfTotal",
                                      { percentage: data.percentage }
                                    )}
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
                            {t("carCalculator.results.carPrice")}
                          </span>
                        </span>
                        <span className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            ${parseFloat(results.carPrice).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            (
                            {(
                              (parseFloat(results.carPrice) /
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
                            {t("carCalculator.results.downPayment")}
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
                            {t("carCalculator.results.otherCosts")}
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
                      <span>{t("carCalculator.results.loanDetails")}</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.monthlyPayment")}
                        </span>
                        <span className="font-bold text-lg text-blue-600">
                          ${results.monthlyPayment}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t(
                            "carCalculator.results.monthlyPaymentForDesiredHorizon"
                          )}
                        </span>
                        <span className="font-bold text-base text-indigo-600">
                          ${results.monthlyPaymentForDesiredHorizon}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.loanAmount")}
                        </span>
                        <span className="font-bold text-base text-gray-900">
                          ${parseFloat(results.loanAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.totalInterest")}
                        </span>
                        <span className="font-bold text-base text-orange-600">
                          ${parseFloat(results.totalInterest).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.totalPayment")}
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
                      <span>{t("carCalculator.results.costBreakdown")}</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.carPrice")}
                        </span>
                        <span className="font-bold text-base text-indigo-600">
                          ${parseFloat(results.carPrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.salesTax")}
                        </span>
                        <span className="font-bold text-base text-red-600">
                          ${parseFloat(results.salesTax).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.downPayment")}
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
                          {t("carCalculator.results.tradeInNetValue")}
                        </span>
                        <span className="font-bold text-base text-teal-600">
                          $
                          {parseFloat(results.tradeInNetValue).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span className="text-gray-700 text-sm font-medium">
                          {t("carCalculator.results.totalCost")}
                        </span>
                        <span className="font-bold text-base text-indigo-600">
                          ${parseFloat(results.totalCost).toLocaleString()}
                        </span>
                      </div>

                      {/* Affordability Section */}
                      <div className="border-t border-gray-200 pt-3 space-y-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-sm space-y-2">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.affordability")}
                          </div>
                          <div
                            className={`font-bold text-sm px-3 py-1 rounded-sm ${
                              results.affordabilityCheck ===
                              t("carCalculator.results.affordable")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {results.affordabilityCheck}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affordability Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base border-b border-purple-200 pb-2 flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-purple-600" />
                    <span>
                      {t("carCalculator.results.affordabilityAnalysis")}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Budget vs Required Payment */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 text-sm border-b border-gray-200 pb-2">
                        {t("carCalculator.results.budgetComparison")}
                      </h5>
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.monthlyPaymentBudget")}
                          </div>
                          <div className="text-right font-bold text-base text-green-600">
                            $
                            {parseFloat(
                              formData.monthlyPaymentBudget
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.requiredMonthlyPayment")}
                          </div>
                          <div className="text-right font-bold text-base text-red-600">
                            ${results.monthlyPayment}
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.budgetDifference")}
                          </div>
                          <div className="text-right font-bold text-base text-orange-600">
                            $
                            {(
                              parseFloat(results.monthlyPayment) -
                              parseFloat(formData.monthlyPaymentBudget)
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.budgetUtilization")}
                          </div>
                          <div className="text-right font-bold text-base text-blue-600">
                            {results.budgetUtilization}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Maximum Affordable Car */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 text-sm border-b border-gray-200 pb-2">
                        {t("carCalculator.results.maxAffordableCar")}
                      </h5>
                      <div className="space-y-2">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.maxAffordableCarPrice")}
                          </div>
                          <div className="text-right font-bold text-base text-purple-600">
                            $
                            {parseFloat(
                              results.maxAffordableCarPrice
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <div className="text-gray-700 text-sm font-medium">
                            {t("carCalculator.results.maxAffordableLoanAmount")}
                          </div>
                          <div className="text-right font-bold text-base text-indigo-600">
                            $
                            {parseFloat(
                              results.maxAffordableLoanAmount
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-800 font-medium">
                            💡 {t("carCalculator.results.affordabilityTip")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Income Guidelines */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 text-sm border-b border-gray-200 pb-2">
                        {t("carCalculator.results.incomeGuidelines")}
                      </h5>
                      <div className="space-y-2">
                        {formData.monthlyIncome ? (
                          <>
                            <div className="p-3 bg-emerald-50 rounded-lg">
                              <div className="text-gray-700 text-sm font-medium">
                                {t("carCalculator.results.monthlyIncome")}
                              </div>
                              <div className="text-right font-bold text-base text-emerald-600">
                                $
                                {parseFloat(
                                  formData.monthlyIncome
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                              <div className="text-gray-700 text-sm font-medium">
                                {t(
                                  "carCalculator.results.maxRecommendedPayment"
                                )}
                              </div>
                              <div className="text-right font-bold text-base text-amber-600">
                                $
                                {(
                                  parseFloat(formData.monthlyIncome) *
                                  (parseFloat(
                                    formData.incomeGuidelinePercentage
                                  ) /
                                    100)
                                ).toFixed(2)}
                              </div>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-lg">
                              <div className="text-gray-700 text-sm font-medium">
                                {t("carCalculator.results.incomeUtilization")}
                              </div>
                              <div className="text-right font-bold text-base text-rose-600">
                                {results.incomeUtilization}%
                              </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <div className="text-gray-700 text-sm font-medium">
                                {t(
                                  "carCalculator.results.incomeGuidelineCheck"
                                )}
                              </div>
                              <div
                                className={`font-bold text-sm px-3 py-1 rounded-sm ${
                                  results.incomeGuidelineCheck ===
                                  "Within guidelines"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {results.incomeGuidelineCheck}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 text-center">
                              {t(
                                "carCalculator.results.addMonthlyIncomeForGuidelines"
                              )}
                            </p>
                          </div>
                        )}
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
