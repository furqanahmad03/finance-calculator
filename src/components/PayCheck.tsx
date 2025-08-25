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
import CalculatorLayout from "./CalculatorLayout";
import { toast } from "sonner";
import {
  calculateFederalTax,
  getStandardDeduction,
  getFICARates,
  type StandardDeductions,
} from "@/lib/tax-config";
import {
  DollarSign,
  Calculator,
  Calendar,
  User,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { PayCheckForm, PayCheckResults } from "@/interfaces/pay-check";

export default function PayCheck() {
  const t = useTranslations();
  const [formData, setFormData] = useState<PayCheckForm>({
    annualSalary: "",
    payFrequency: "bi-weekly",
    filingStatus: "single",
    taxYear: new Date().getFullYear().toString(),
    stateTaxRate: "0",
    cityTaxRate: "0",
    isSelfEmployed: false,
    otherEarnedIncome: "0",
    unearnedIncome: "0",
    childrenUnder17: "0",
    otherDependents: "0",
    retirement401k: "0",
    healthInsurance: "0",
    hsaFsa: "0",
    otherPreTax: "0",
    iraContributions: "0",
    studentLoanInterest: "0",
    otherAdjustments: "0",
    mortgageInterest: "0",
    charitableDonations: "0",
    stateLocalTaxes: "0",
    propertyTaxes: "0",
    salesTaxes: "0",
    medicalExpenses: "0",
  });

  const [results, setResults] = useState<PayCheckResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const calculatePaycheck = () => {
    setIsCalculating(true);
    toast.loading(t("payCheck.toasts.calculating"), {
      id: "paycheck-calculation",
    });

    setTimeout(() => {
      try {
        const annualSalary = parseFloat(formData.annualSalary) || 0;
        const otherEarnedIncome = parseFloat(formData.otherEarnedIncome) || 0;
        const unearnedIncome = parseFloat(formData.unearnedIncome) || 0;
        const stateTaxRate = parseFloat(formData.stateTaxRate) || 0;
        const cityTaxRate = parseFloat(formData.cityTaxRate) || 0;

        const retirement401k = parseFloat(formData.retirement401k) || 0;
        const healthInsurance = parseFloat(formData.healthInsurance) || 0;
        const hsaFsa = parseFloat(formData.hsaFsa) || 0;
        const otherPreTax = parseFloat(formData.otherPreTax) || 0;

        const iraContributions = parseFloat(formData.iraContributions) || 0;
        const studentLoanInterest =
          parseFloat(formData.studentLoanInterest) || 0;
        const otherAdjustments = parseFloat(formData.otherAdjustments) || 0;

        const mortgageInterest = parseFloat(formData.mortgageInterest) || 0;
        const charitableDonations =
          parseFloat(formData.charitableDonations) || 0;
        const stateLocalTaxes = parseFloat(formData.stateLocalTaxes) || 0;
        const propertyTaxes = parseFloat(formData.propertyTaxes) || 0;
        const salesTaxes = parseFloat(formData.salesTaxes) || 0;
        const medicalExpenses = parseFloat(formData.medicalExpenses) || 0;

        const grossIncome = annualSalary + otherEarnedIncome + unearnedIncome;

        const totalPreTaxDeductions =
          retirement401k + healthInsurance + hsaFsa + otherPreTax;

        const agi = grossIncome - totalPreTaxDeductions;

        const taxYear = parseInt(formData.taxYear);

        const standardDeduction = getStandardDeduction(
          formData.filingStatus as keyof StandardDeductions,
          taxYear
        );

        const totalItemizedDeductions =
          mortgageInterest +
          charitableDonations +
          stateLocalTaxes +
          propertyTaxes +
          salesTaxes +
          medicalExpenses;

        const deductionsUsed = Math.max(
          standardDeduction,
          totalItemizedDeductions
        );

        const taxableIncome =
          agi -
          deductionsUsed -
          iraContributions -
          studentLoanInterest -
          otherAdjustments;

        let federalTax = calculateFederalTax(
          taxableIncome,
          formData.filingStatus as keyof StandardDeductions,
          taxYear
        );

        const childrenUnder17 = parseInt(formData.childrenUnder17) || 0;
        const otherDependents = parseInt(formData.otherDependents) || 0;

        const childTaxCredit = childrenUnder17 * 2000;
        const otherDependentCredit = otherDependents * 500;
        const totalTaxCredits = childTaxCredit + otherDependentCredit;

        federalTax = Math.max(0, federalTax - totalTaxCredits);

        const stateTax = (agi - totalPreTaxDeductions) * (stateTaxRate / 100);
        const cityTax = (agi - totalPreTaxDeductions) * (cityTaxRate / 100);

        const ficaRates = getFICARates(taxYear);
        let socialSecurityTax =
          Math.min(agi, ficaRates.socialSecurityLimit) *
          ficaRates.socialSecurityRate;
        let medicareTax = agi * ficaRates.medicareRate;

        if (formData.isSelfEmployed) {
          socialSecurityTax *= 2;
          medicareTax *= 2;
        }

        const totalTaxes =
          federalTax + stateTax + cityTax + socialSecurityTax + medicareTax;
        const netPay = agi - totalTaxes;

        const takeHomePercentage = (netPay / grossIncome) * 100;
        const effectiveTaxRate = (totalTaxes / grossIncome) * 100;

        let payPeriods = 26;
        switch (formData.payFrequency) {
          case "weekly":
            payPeriods = 52;
            break;
          case "bi-weekly":
            payPeriods = 26;
            break;
          case "semi-monthly":
            payPeriods = 24;
            break;
          case "monthly":
            payPeriods = 12;
            break;
          case "yearly":
            payPeriods = 1;
            break;
        }

        const grossPay = (grossIncome / payPeriods).toFixed(2);
        const netPayPerPeriod = (netPay / payPeriods).toFixed(2);

        setResults({
          grossPay: grossPay,
          federalTax: (federalTax / payPeriods).toFixed(2),
          stateTax: (stateTax / payPeriods).toFixed(2),
          cityTax: (cityTax / payPeriods).toFixed(2),
          socialSecurityTax: (socialSecurityTax / payPeriods).toFixed(2),
          medicareTax: (medicareTax / payPeriods).toFixed(2),
          preTaxDeductions: (totalPreTaxDeductions / payPeriods).toFixed(2),
          postTaxAdjustments: (
            (iraContributions + studentLoanInterest + otherAdjustments) /
            payPeriods
          ).toFixed(2),
          itemizedDeductions: (deductionsUsed / payPeriods).toFixed(2),
          netPay: netPayPerPeriod,
          takeHomePercentage: takeHomePercentage.toFixed(1),
          effectiveTaxRate: effectiveTaxRate.toFixed(1),
          grossAnnual: grossIncome.toFixed(2),
          totalDeductions: totalPreTaxDeductions.toFixed(2),
          netAnnual: netPay.toFixed(2),
          taxCredits: (totalTaxCredits / payPeriods).toFixed(2),
          breakdown: {
            grossAnnual: grossIncome.toFixed(2),
            totalDeductions: totalPreTaxDeductions.toFixed(2),
            totalTaxes: totalTaxes.toFixed(2),
            netAnnual: netPay.toFixed(2),
          },
        });

        toast.success(t("payCheck.toasts.calculationCompleted"), {
          description: t("payCheck.toasts.paycheckBreakdownReady"),
        });
      } catch (error) {
        toast.error(t("payCheck.toasts.calculationFailed"), {
          id: "paycheck-calculation",
          description: t("payCheck.toasts.checkInputsAndRetry"),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("paycheck-calculation");
      }
    }, 800);
  };

  const isFormValid = () => {
    return (
      formData.annualSalary &&
      formData.payFrequency &&
      formData.filingStatus &&
      formData.taxYear
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
    return `${parseFloat(value).toFixed(1)}%`;
  };

  return (
    <CalculatorLayout
      title={t("payCheck.title")}
      description={t("payCheck.description")}
      icon={<DollarSign className="w-6 h-6 text-blue-600" />}
    >
      <div className="space-y-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 px-0 from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <Calculator className="w-6 h-6 text-yellow-300" />
              <span>{t("payCheck.requiredInformation.title")}</span>
            </CardTitle>
            <p className="text-blue-100 text-sm font-normal mt-1">
              {t("payCheck.requiredInformation.description")}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="annualSalary"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.annualSalary.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="annualSalary"
                    name="annualSalary"
                    value={formData.annualSalary}
                    onChange={handleInputChange}
                    placeholder={t(
                      "payCheck.requiredInformation.annualSalary.placeholder"
                    )}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.annualSalary.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="payFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.payFrequency.label")}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("payFrequency", value)
                    }
                    defaultValue={formData.payFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "payCheck.requiredInformation.payFrequency.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">
                        {t(
                          "payCheck.requiredInformation.payFrequency.options.weekly"
                        )}
                      </SelectItem>
                      <SelectItem value="bi-weekly">
                        {t(
                          "payCheck.requiredInformation.payFrequency.options.bi-weekly"
                        )}
                      </SelectItem>
                      <SelectItem value="semi-monthly">
                        {t(
                          "payCheck.requiredInformation.payFrequency.options.semi-monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "payCheck.requiredInformation.payFrequency.options.monthly"
                        )}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t(
                          "payCheck.requiredInformation.payFrequency.options.yearly"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.payFrequency.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="filingStatus"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.filingStatus.label")}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("filingStatus", value)
                    }
                    defaultValue={formData.filingStatus}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "payCheck.requiredInformation.filingStatus.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">
                        {t(
                          "payCheck.requiredInformation.filingStatus.options.single"
                        )}
                      </SelectItem>
                      <SelectItem value="married-jointly">
                        {t(
                          "payCheck.requiredInformation.filingStatus.options.married-jointly"
                        )}
                      </SelectItem>
                      <SelectItem value="married-separately">
                        {t(
                          "payCheck.requiredInformation.filingStatus.options.married-separately"
                        )}
                      </SelectItem>
                      <SelectItem value="head-of-household">
                        {t(
                          "payCheck.requiredInformation.filingStatus.options.head-of-household"
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.filingStatus.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="taxYear"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      {t("payCheck.requiredInformation.taxYear.label")}
                    </span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("taxYear", value)
                    }
                    defaultValue={formData.taxYear}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue
                        placeholder={t(
                          "payCheck.requiredInformation.taxYear.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.taxYear.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="stateTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.stateTaxRate.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="stateTaxRate"
                    name="stateTaxRate"
                    value={formData.stateTaxRate}
                    onChange={handleInputChange}
                    placeholder={t(
                      "payCheck.requiredInformation.stateTaxRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.stateTaxRate.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="cityTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.cityTaxRate.label")}
                    </span>
                  </label>
                  <Input
                    type="number"
                    id="cityTaxRate"
                    name="cityTaxRate"
                    value={formData.cityTaxRate}
                    onChange={handleInputChange}
                    placeholder={t(
                      "payCheck.requiredInformation.cityTaxRate.placeholder"
                    )}
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.cityTaxRate.help")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      {t("payCheck.requiredInformation.selfEmployed.label")}
                    </span>
                  </label>
                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.isSelfEmployed}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "isSelfEmployed",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">
                        {t("payCheck.requiredInformation.selfEmployed.yes")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={!formData.isSelfEmployed}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "isSelfEmployed",
                            !(checked as boolean)
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">
                        {t("payCheck.requiredInformation.selfEmployed.no")}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("payCheck.requiredInformation.selfEmployed.help")}
                  </p>
                </div>
              </div>

              {/* Optional Fields Toggle */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {showOptionalFields
                    ? t("payCheck.optionalFields.hide")
                    : t("payCheck.optionalFields.show")}
                </Button>
              </div>

              {/* Optional Fields */}
              {showOptionalFields && (
                <div className="space-y-8 pt-6 border-t border-gray-200">
                  {/* Additional Income */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>
                        {t("payCheck.optionalFields.additionalIncome.title")}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="otherEarnedIncome"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.additionalIncome.otherEarnedIncome.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="otherEarnedIncome"
                          name="otherEarnedIncome"
                          value={formData.otherEarnedIncome}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.additionalIncome.otherEarnedIncome.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.additionalIncome.otherEarnedIncome.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="unearnedIncome"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.additionalIncome.unearnedIncome.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="unearnedIncome"
                          name="unearnedIncome"
                          value={formData.unearnedIncome}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.additionalIncome.unearnedIncome.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.additionalIncome.unearnedIncome.help"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dependents */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>
                        {t("payCheck.optionalFields.dependents.title")}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="childrenUnder17"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.dependents.childrenUnder17.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="childrenUnder17"
                          name="childrenUnder17"
                          value={formData.childrenUnder17}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.dependents.childrenUnder17.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.dependents.childrenUnder17.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="otherDependents"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.dependents.otherDependents.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="otherDependents"
                          name="otherDependents"
                          value={formData.otherDependents}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.dependents.otherDependents.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-700">
                          {t(
                            "payCheck.optionalFields.dependents.otherDependents.help"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-tax Deductions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span>
                        {t("payCheck.optionalFields.preTaxDeductions.title")}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="retirement401k"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.retirement401k.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="retirement401k"
                          name="retirement401k"
                          value={formData.retirement401k}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.preTaxDeductions.retirement401k.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.retirement401k.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="healthInsurance"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.healthInsurance.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="healthInsurance"
                          name="healthInsurance"
                          value={formData.healthInsurance}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.preTaxDeductions.healthInsurance.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.healthInsurance.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="hsaFsa"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.hsaFsa.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="hsaFsa"
                          name="hsaFsa"
                          value={formData.hsaFsa}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.preTaxDeductions.hsaFsa.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.hsaFsa.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="otherPreTax"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.otherPreTax.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="otherPreTax"
                          name="otherPreTax"
                          value={formData.otherPreTax}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.preTaxDeductions.otherPreTax.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.preTaxDeductions.otherPreTax.help"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post-tax Adjustments */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <PiggyBank className="w-5 h-5 text-green-600" />
                      <span>
                        {t("payCheck.optionalFields.postTaxAdjustments.title")}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="iraContributions"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.iraContributions.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="iraContributions"
                          name="iraContributions"
                          value={formData.iraContributions}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.postTaxAdjustments.iraContributions.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.iraContributions.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="studentLoanInterest"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.studentLoanInterest.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="studentLoanInterest"
                          name="studentLoanInterest"
                          value={formData.studentLoanInterest}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.postTaxAdjustments.studentLoanInterest.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.studentLoanInterest.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="otherAdjustments"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.otherAdjustments.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="otherAdjustments"
                          name="otherAdjustments"
                          value={formData.otherAdjustments}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.postTaxAdjustments.otherAdjustments.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.postTaxAdjustments.otherAdjustments.help"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Deductions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Receipt className="w-5 h-5 text-purple-600" />
                      <span>
                        {t("payCheck.optionalFields.itemizedDeductions.title")}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="mortgageInterest"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.mortgageInterest.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="mortgageInterest"
                          name="mortgageInterest"
                          value={formData.mortgageInterest}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.mortgageInterest.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.mortgageInterest.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="charitableDonations"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.charitableDonations.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="charitableDonations"
                          name="charitableDonations"
                          value={formData.charitableDonations}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.charitableDonations.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.charitableDonations.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="stateLocalTaxes"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.stateLocalTaxes.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="stateLocalTaxes"
                          name="stateLocalTaxes"
                          value={formData.stateLocalTaxes}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.stateLocalTaxes.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.stateLocalTaxes.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="propertyTaxes"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.propertyTaxes.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="propertyTaxes"
                          name="propertyTaxes"
                          value={formData.propertyTaxes}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.propertyTaxes.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.propertyTaxes.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="salesTaxes"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.salesTaxes.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="salesTaxes"
                          name="salesTaxes"
                          value={formData.salesTaxes}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.salesTaxes.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.salesTaxes.help"
                          )}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="medicalExpenses"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.medicalExpenses.label"
                          )}
                        </label>
                        <Input
                          type="number"
                          id="medicalExpenses"
                          name="medicalExpenses"
                          value={formData.medicalExpenses}
                          onChange={handleInputChange}
                          placeholder={t(
                            "payCheck.optionalFields.itemizedDeductions.medicalExpenses.placeholder"
                          )}
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                          {t(
                            "payCheck.optionalFields.itemizedDeductions.medicalExpenses.help"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button
                  onClick={calculatePaycheck}
                  disabled={!isFormValid() || isCalculating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("payCheck.calculatingButton")}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t("payCheck.calculateButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="py-0 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <DollarSign className="w-6 h-6 text-yellow-300" />
                <span>{t("payCheck.results.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Per Pay Period Summary */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 text-lg mb-3">
                      {t("payCheck.results.perPayPeriod", {
                        frequency: formData.payFrequency.replace("-", " "),
                      })}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.grossPay")}
                        </span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(results.grossPay)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.netPay")}
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(results.netPay)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.takeHomePercentage")}
                        </span>
                        <span className="font-bold text-blue-900">
                          {formatPercentage(results.takeHomePercentage)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-800 text-lg mb-3">
                      {t("payCheck.results.taxSummary")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.federalTax")}
                        </span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(results.federalTax)}
                        </span>
                      </div>
                      {parseFloat(results.taxCredits) > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span className="text-gray-700">
                            {t("payCheck.results.taxCredits")}
                          </span>
                          <span className="font-bold">
                            -{formatCurrency(results.taxCredits)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.stateTax")}
                        </span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(results.stateTax)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.ficaTaxes")}
                        </span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(
                            (
                              parseFloat(results.socialSecurityTax) +
                              parseFloat(results.medicareTax)
                            ).toString()
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.effectiveTaxRate")}
                        </span>
                        <span className="font-bold text-green-900">
                          {formatPercentage(results.effectiveTaxRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-purple-800 text-lg mb-3">
                      {t("payCheck.results.deductions")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.preTax")}
                        </span>
                        <span className="font-bold text-purple-900">
                          {formatCurrency(results.preTaxDeductions)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.postTax")}
                        </span>
                        <span className="font-bold text-purple-900">
                          {formatCurrency(results.postTaxAdjustments)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.itemized")}
                        </span>
                        <span className="font-bold text-purple-900">
                          {formatCurrency(results.itemizedDeductions)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <h3 className="font-semibold text-orange-800 text-lg mb-3">
                      {t("payCheck.results.taxDetails")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.socialSecurity")}
                        </span>
                        <span className="font-bold text-orange-900">
                          {formatCurrency(results.socialSecurityTax)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.medicare")}
                        </span>
                        <span className="font-bold text-orange-900">
                          {formatCurrency(results.medicareTax)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.cityTax")}
                        </span>
                        <span className="font-bold text-orange-900">
                          {formatCurrency(results.cityTax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
                    <h3 className="font-semibold text-teal-800 text-lg mb-3">
                      {t("payCheck.results.annualSummary")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.grossAnnual")}
                        </span>
                        <span className="font-bold text-teal-900">
                          {formatCurrency(results.grossAnnual)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.totalDeductions")}
                        </span>
                        <span className="font-bold text-teal-900">
                          {formatCurrency(results.totalDeductions)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {t("payCheck.results.netAnnual")}
                        </span>
                        <span className="font-bold text-teal-900 text-lg">
                          {formatCurrency(results.netAnnual)}
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
