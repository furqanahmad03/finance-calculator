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
import CalculatorLayout from "./CalculatorLayout";
import {
  DollarSign,
  Calculator,
  Calendar,
  Percent,
  User,
  Building,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface PayCheckForm {
  // Required Fields
  annualSalary: string;
  payFrequency: string;
  filingStatus: string;
  stateTaxRate: string;
  cityTaxRate: string;
  isSelfEmployed: boolean;
  
  // Optional Fields
  otherEarnedIncome: string;
  unearnedIncome: string;
  childrenUnder17: string;
  otherDependents: string;
  
  // Pre-tax deductions
  retirement401k: string;
  healthInsurance: string;
  hsaFsa: string;
  otherPreTax: string;
  
  // Post-tax adjustments
  iraContributions: string;
  studentLoanInterest: string;
  otherAdjustments: string;
  
  // Itemized deductions
  mortgageInterest: string;
  charitableDonations: string;
  stateLocalTaxes: string;
  propertyTaxes: string;
  salesTaxes: string;
  medicalExpenses: string;
}

interface PayCheckResults {
  grossPay: string;
  federalTax: string;
  stateTax: string;
  cityTax: string;
  socialSecurityTax: string;
  medicareTax: string;
  preTaxDeductions: string;
  postTaxAdjustments: string;
  itemizedDeductions: string;
  netPay: string;
  takeHomePercentage: string;
  effectiveTaxRate: string;
  breakdown: {
    grossAnnual: string;
    totalDeductions: string;
    totalTaxes: string;
    netAnnual: string;
  };
}

export default function PayCheck() {
  const [formData, setFormData] = useState<PayCheckForm>({
    annualSalary: "",
    payFrequency: "bi-weekly",
    filingStatus: "single",
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
    // Parse form data
    const annualSalary = parseFloat(formData.annualSalary) || 0;
    const otherEarnedIncome = parseFloat(formData.otherEarnedIncome) || 0;
    const unearnedIncome = parseFloat(formData.unearnedIncome) || 0;
    const stateTaxRate = parseFloat(formData.stateTaxRate) || 0;
    const cityTaxRate = parseFloat(formData.cityTaxRate) || 0;
    
    // Pre-tax deductions
    const retirement401k = parseFloat(formData.retirement401k) || 0;
    const healthInsurance = parseFloat(formData.healthInsurance) || 0;
    const hsaFsa = parseFloat(formData.hsaFsa) || 0;
    const otherPreTax = parseFloat(formData.otherPreTax) || 0;
    
    // Post-tax adjustments
    const iraContributions = parseFloat(formData.iraContributions) || 0;
    const studentLoanInterest = parseFloat(formData.studentLoanInterest) || 0;
    const otherAdjustments = parseFloat(formData.otherAdjustments) || 0;
    
    // Itemized deductions
    const mortgageInterest = parseFloat(formData.mortgageInterest) || 0;
    const charitableDonations = parseFloat(formData.charitableDonations) || 0;
    const stateLocalTaxes = parseFloat(formData.stateLocalTaxes) || 0;
    const propertyTaxes = parseFloat(formData.propertyTaxes) || 0;
    const salesTaxes = parseFloat(formData.salesTaxes) || 0;
    const medicalExpenses = parseFloat(formData.medicalExpenses) || 0;

    // Calculate gross income
    const grossIncome = annualSalary + otherEarnedIncome + unearnedIncome;
    
    // Calculate pre-tax deductions
    const totalPreTaxDeductions = retirement401k + healthInsurance + hsaFsa + otherPreTax;
    
    // Calculate adjusted gross income (AGI)
    const agi = grossIncome - totalPreTaxDeductions;
    
    // Calculate standard deduction based on filing status (2024 rates)
    let standardDeduction = 0;
    switch (formData.filingStatus) {
      case "single":
        standardDeduction = 14600;
        break;
      case "married-jointly":
        standardDeduction = 29200;
        break;
      case "married-separately":
        standardDeduction = 14600;
        break;
      case "head-of-household":
        standardDeduction = 21900;
        break;
      default:
        standardDeduction = 14600;
    }
    
    // Calculate itemized deductions
    const totalItemizedDeductions = mortgageInterest + charitableDonations + 
      stateLocalTaxes + propertyTaxes + salesTaxes + medicalExpenses;
    
    // Use the larger of standard or itemized deductions
    const deductionsUsed = Math.max(standardDeduction, totalItemizedDeductions);
    
    // Calculate taxable income
    const taxableIncome = agi - deductionsUsed - iraContributions - studentLoanInterest - otherAdjustments;
    
    // Calculate federal tax (simplified 2024 brackets)
    let federalTax = 0;
    if (taxableIncome > 0) {
      if (formData.filingStatus === "single") {
        if (taxableIncome <= 11600) {
          federalTax = taxableIncome * 0.10;
        } else if (taxableIncome <= 47150) {
          federalTax = 1160 + (taxableIncome - 11600) * 0.12;
        } else if (taxableIncome <= 100525) {
          federalTax = 5423 + (taxableIncome - 47150) * 0.22;
        } else if (taxableIncome <= 191950) {
          federalTax = 17289 + (taxableIncome - 100525) * 0.24;
        } else if (taxableIncome <= 243725) {
          federalTax = 39493 + (taxableIncome - 191950) * 0.32;
        } else if (taxableIncome <= 609350) {
          federalTax = 64093 + (taxableIncome - 243725) * 0.35;
        } else {
          federalTax = 192123 + (taxableIncome - 609350) * 0.37;
        }
      } else if (formData.filingStatus === "married-jointly") {
        if (taxableIncome <= 23200) {
          federalTax = taxableIncome * 0.10;
        } else if (taxableIncome <= 94300) {
          federalTax = 2320 + (taxableIncome - 23200) * 0.12;
        } else if (taxableIncome <= 201050) {
          federalTax = 10847 + (taxableIncome - 94300) * 0.22;
        } else if (taxableIncome <= 383900) {
          federalTax = 34578 + (taxableIncome - 201050) * 0.24;
        } else if (taxableIncome <= 487450) {
          federalTax = 78986 + (taxableIncome - 383900) * 0.32;
        } else if (taxableIncome <= 731200) {
          federalTax = 128186 + (taxableIncome - 487450) * 0.35;
        } else {
          federalTax = 213486 + (taxableIncome - 731200) * 0.37;
        }
      }
    }
    
    // Calculate state and city taxes
    const stateTax = (agi - totalPreTaxDeductions) * (stateTaxRate / 100);
    const cityTax = (agi - totalPreTaxDeductions) * (cityTaxRate / 100);
    
    // Calculate FICA taxes (Social Security and Medicare)
    const socialSecurityTax = Math.min(agi, 168600) * 0.062; // 6.2% up to $168,600 (2024)
    const medicareTax = agi * 0.0145; // 1.45% (no limit)
    
    // Calculate net pay
    const totalTaxes = federalTax + stateTax + cityTax + socialSecurityTax + medicareTax;
    const netPay = agi - totalTaxes;
    
    // Calculate percentages
    const takeHomePercentage = ((netPay / grossIncome) * 100);
    const effectiveTaxRate = ((totalTaxes / grossIncome) * 100);
    
    // Calculate per-pay-period amounts
    let payPeriods = 26; // bi-weekly default
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
      postTaxAdjustments: ((iraContributions + studentLoanInterest + otherAdjustments) / payPeriods).toFixed(2),
      itemizedDeductions: (deductionsUsed / payPeriods).toFixed(2),
      netPay: netPayPerPeriod,
      takeHomePercentage: takeHomePercentage.toFixed(1),
      effectiveTaxRate: effectiveTaxRate.toFixed(1),
      breakdown: {
        grossAnnual: grossIncome.toFixed(2),
        totalDeductions: totalPreTaxDeductions.toFixed(2),
        totalTaxes: totalTaxes.toFixed(2),
        netAnnual: netPay.toFixed(2),
      },
    });
  };

  const isFormValid = () => {
    return (
      formData.annualSalary &&
      formData.payFrequency &&
      formData.filingStatus
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
    return `${parseFloat(value).toFixed(1)}%`;
  };

  return (
    <CalculatorLayout
      title="Paycheck Calculator"
      description="Calculate your take-home pay after taxes, deductions, and adjustments"
      icon={<DollarSign className="w-6 h-6 text-blue-600" />}
    >
      <div className="space-y-8">
        {/* Required Fields */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <Calculator className="w-6 h-6 text-yellow-300" />
              <span>Required Information</span>
            </CardTitle>
            <p className="text-blue-100 text-sm font-normal mt-1">
              Fill in these essential details for basic paycheck calculation
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
                    <span>Annual Salary (Gross Job Income)</span>
                  </label>
                  <Input
                    type="number"
                    id="annualSalary"
                    name="annualSalary"
                    value={formData.annualSalary}
                    onChange={handleInputChange}
                    placeholder="75,000"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your yearly salary before taxes
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="payFrequency"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Pay Frequency</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("payFrequency", value)
                    }
                    defaultValue={formData.payFrequency}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How often you get paid
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="filingStatus"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Filing Status</span>
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("filingStatus", value)
                    }
                    defaultValue={formData.filingStatus}
                  >
                    <SelectTrigger className="w-full !h-12 !text-sm px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-jointly">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separately">Married Filing Separately</SelectItem>
                      <SelectItem value="head-of-household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Your tax filing status
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="stateTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>State Income Tax Rate</span>
                  </label>
                  <Input
                    type="number"
                    id="stateTaxRate"
                    name="stateTaxRate"
                    value={formData.stateTaxRate}
                    onChange={handleInputChange}
                    placeholder="5.0"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your state's income tax rate (%)
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="cityTaxRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>City/Municipal Tax Rate</span>
                  </label>
                  <Input
                    type="number"
                    id="cityTaxRate"
                    name="cityTaxRate"
                    value={formData.cityTaxRate}
                    onChange={handleInputChange}
                    placeholder="2.0"
                    step="0.1"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    Your city's income tax rate (%)
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Self-Employed / Independent Contractor</span>
                  </label>
                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.isSelfEmployed}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isSelfEmployed", checked as boolean)
                        }
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={!formData.isSelfEmployed}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isSelfEmployed", !(checked as boolean))
                        }
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Are you self-employed or an independent contractor?
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
                  {showOptionalFields ? "Hide" : "Show"} Optional Fields for Accuracy
                </Button>
              </div>

              {/* Optional Fields */}
              {showOptionalFields && (
                <div className="space-y-8 pt-6 border-t border-gray-200">
                  {/* Additional Income */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Additional Income</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="otherEarnedIncome" className="block text-sm font-medium text-gray-700">
                          Other Earned Income (2nd/3rd job, freelance)
                        </label>
                        <Input
                          type="number"
                          id="otherEarnedIncome"
                          name="otherEarnedIncome"
                          value={formData.otherEarnedIncome}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="unearnedIncome" className="block text-sm font-medium text-gray-700">
                          Unearned Income (interest, dividends, rental)
                        </label>
                        <Input
                          type="number"
                          id="unearnedIncome"
                          name="unearnedIncome"
                          value={formData.unearnedIncome}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dependents */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Dependents</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="childrenUnder17" className="block text-sm font-medium text-gray-700">
                          Children Under Age 17
                        </label>
                        <Input
                          type="number"
                          id="childrenUnder17"
                          name="childrenUnder17"
                          value={formData.childrenUnder17}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="otherDependents" className="block text-sm font-medium text-gray-700">
                          Other Dependents
                        </label>
                        <Input
                          type="number"
                          id="otherDependents"
                          name="otherDependents"
                          value={formData.otherDependents}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pre-tax Deductions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span>Pre-tax Deductions</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="retirement401k" className="block text-sm font-medium text-gray-700">
                          401(k)/403(b) Contributions
                        </label>
                        <Input
                          type="number"
                          id="retirement401k"
                          name="retirement401k"
                          value={formData.retirement401k}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="healthInsurance" className="block text-sm font-medium text-gray-700">
                          Health Insurance Premiums
                        </label>
                        <Input
                          type="number"
                          id="healthInsurance"
                          name="healthInsurance"
                          value={formData.healthInsurance}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="hsaFsa" className="block text-sm font-medium text-gray-700">
                          HSA/FSA Contributions
                        </label>
                        <Input
                          type="number"
                          id="hsaFsa"
                          name="hsaFsa"
                          value={formData.hsaFsa}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="otherPreTax" className="block text-sm font-medium text-gray-700">
                          Other Pre-tax Deductions
                        </label>
                        <Input
                          type="number"
                          id="otherPreTax"
                          name="otherPreTax"
                          value={formData.otherPreTax}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Post-tax Adjustments */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <PiggyBank className="w-5 h-5 text-green-600" />
                      <span>Post-tax Adjustments</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="iraContributions" className="block text-sm font-medium text-gray-700">
                          IRA Contributions
                        </label>
                        <Input
                          type="number"
                          id="iraContributions"
                          name="iraContributions"
                          value={formData.iraContributions}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="studentLoanInterest" className="block text-sm font-medium text-gray-700">
                          Student Loan Interest
                        </label>
                        <Input
                          type="number"
                          id="studentLoanInterest"
                          name="studentLoanInterest"
                          value={formData.studentLoanInterest}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="otherAdjustments" className="block text-sm font-medium text-gray-700">
                          Other Adjustments
                        </label>
                        <Input
                          type="number"
                          id="otherAdjustments"
                          name="otherAdjustments"
                          value={formData.otherAdjustments}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Itemized Deductions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Receipt className="w-5 h-5 text-purple-600" />
                      <span>Itemized Deductions (if not using standard)</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="mortgageInterest" className="block text-sm font-medium text-gray-700">
                          Mortgage Interest
                        </label>
                        <Input
                          type="number"
                          id="mortgageInterest"
                          name="mortgageInterest"
                          value={formData.mortgageInterest}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="charitableDonations" className="block text-sm font-medium text-gray-700">
                          Charitable Donations
                        </label>
                        <Input
                          type="number"
                          id="charitableDonations"
                          name="charitableDonations"
                          value={formData.charitableDonations}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="stateLocalTaxes" className="block text-sm font-medium text-gray-700">
                          State/Local Income Taxes
                        </label>
                        <Input
                          type="number"
                          id="stateLocalTaxes"
                          name="stateLocalTaxes"
                          value={formData.stateLocalTaxes}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="propertyTaxes" className="block text-sm font-medium text-gray-700">
                          Property Taxes
                        </label>
                        <Input
                          type="number"
                          id="propertyTaxes"
                          name="propertyTaxes"
                          value={formData.propertyTaxes}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="salesTaxes" className="block text-sm font-medium text-gray-700">
                          Sales Taxes
                        </label>
                        <Input
                          type="number"
                          id="salesTaxes"
                          name="salesTaxes"
                          value={formData.salesTaxes}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="medicalExpenses" className="block text-sm font-medium text-gray-700">
                          Medical Expenses (above threshold)
                        </label>
                        <Input
                          type="number"
                          id="medicalExpenses"
                          name="medicalExpenses"
                          value={formData.medicalExpenses}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full h-11 px-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button
                  onClick={calculatePaycheck}
                  disabled={!isFormValid()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Paycheck
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <DollarSign className="w-6 h-6 text-yellow-300" />
                <span>Your Paycheck Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Per Pay Period Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 text-lg mb-3">Per {formData.payFrequency.replace('-', ' ')} Pay Period</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Gross Pay:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(results.grossPay)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Net Pay:</span>
                        <span className="font-bold text-green-600 text-lg">{formatCurrency(results.netPay)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Take Home %:</span>
                        <span className="font-bold text-blue-900">{formatPercentage(results.takeHomePercentage)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-800 text-lg mb-3">Tax Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Federal Tax:</span>
                        <span className="font-bold text-green-900">{formatCurrency(results.federalTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">State Tax:</span>
                        <span className="font-bold text-green-900">{formatCurrency(results.stateTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">FICA Taxes:</span>
                        <span className="font-bold text-green-900">{formatCurrency((parseFloat(results.socialSecurityTax) + parseFloat(results.medicareTax)).toString())}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Effective Tax Rate:</span>
                        <span className="font-bold text-green-900">{formatPercentage(results.effectiveTaxRate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span>Deductions</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Pre-tax:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.preTaxDeductions)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Post-tax:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.postTaxAdjustments)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Itemized:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.itemizedDeductions)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Tax Details</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Social Security:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.socialSecurityTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Medicare:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.medicareTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">City Tax:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.cityTax)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Annual Summary</span>
                    </h4>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Gross Annual:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.grossAnnual)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Total Deductions:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.totalDeductions)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Net Annual:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(results.breakdown.netAnnual)}</span>
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
