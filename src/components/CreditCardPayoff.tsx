"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";
import { CreditCardPayoffForm, CreditCardPayoffResults } from "@/interfaces/credit-card-payoff";

export default function CreditCardPayoff() {
  const t = useTranslations();
  
  const [formData, setFormData] = useState<CreditCardPayoffForm>({
    balance: "",
    annualInterestRate: "",
    paymentApproach: "monthly-payment",
    monthlyPayment: "",
    payoffMonths: "",
  });

  const [results, setResults] = useState<CreditCardPayoffResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
    setIsCalculating(true);
    toast.loading(t('creditCardPayoff.toasts.calculating'), {
      id: "credit-card-payoff-calculation",
    });

    setTimeout(() => {
      try {
        const balance = parseFloat(formData.balance) || 0;
        const annualInterestRate = parseFloat(formData.annualInterestRate) || 0;
        const monthlyInterestRate = annualInterestRate / 100 / 12;

    let monthsToPayoff = 0;
    let requiredMonthlyPayment = 0;
    let totalInterest = 0;
    const projectedPayoff = [];

    if (formData.paymentApproach === "monthly-payment") {
      const monthlyPayment = parseFloat(formData.monthlyPayment) || 0;
      
      if (monthlyPayment <= monthlyInterestRate * balance) {
        monthsToPayoff = Infinity;
        requiredMonthlyPayment = monthlyPayment;
        totalInterest = Infinity;
      } else {
        let remainingBalance = balance;
        let month = 0;
        
        // Add starting balance
        projectedPayoff.push({
          month: 0,
          balance: balance.toFixed(2),
          payment: "0.00",
          interest: "0.00",
          principal: "0.00",
        });
        
        while (remainingBalance > 0 && month < 600) {
          month++;
          const interest = remainingBalance * monthlyInterestRate;
          const principal = monthlyPayment - interest;
          
          remainingBalance = Math.max(0, remainingBalance - principal);
          totalInterest += interest;
          
          projectedPayoff.push({
            month: month,
            balance: remainingBalance.toFixed(2),
            payment: monthlyPayment.toFixed(2),
            interest: interest.toFixed(2),
            principal: principal.toFixed(2),
          });
          
          if (remainingBalance <= 0) {
            break;
          }
        }
        
        monthsToPayoff = month;
      }
      
      requiredMonthlyPayment = monthlyPayment;
    } else {
      const targetMonths = parseFloat(formData.payoffMonths) || 0;
      
      if (targetMonths > 0 && monthlyInterestRate > 0) {
        requiredMonthlyPayment = (balance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, targetMonths)) / 
          (Math.pow(1 + monthlyInterestRate, targetMonths) - 1);
        
        let remainingBalance = balance;
        totalInterest = 0;
        
        // Add starting balance
        projectedPayoff.push({
          month: 0,
          balance: balance.toFixed(2),
          payment: "0.00",
          interest: "0.00",
          principal: "0.00",
        });
        
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

    const totalCost = balance + totalInterest;
    const currentDate = new Date('2024-01-01');
    const payoffDate = monthsToPayoff === Infinity ? 
      new Date('9999-12-31') : 
      new Date(currentDate.getFullYear(), currentDate.getMonth() + monthsToPayoff, currentDate.getDate());
    
    const minimumPayment = Math.max(balance * 0.01, 25);
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
    
    const savings = (minimumInterest > 0 && totalInterest !== Infinity) ? (minimumInterest - totalInterest).toFixed(2) : "0";

        setResults({
          monthsToPayoff: monthsToPayoff === Infinity ? 999 : monthsToPayoff,
          requiredMonthlyPayment: requiredMonthlyPayment.toFixed(2),
          totalInterest: totalInterest === Infinity ? "∞" : totalInterest.toFixed(2),
          totalCost: totalCost === Infinity ? "∞" : totalCost.toFixed(2),
          payoffDate: payoffDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) || 'Unknown Date',
          savings: savings,
          projectedPayoff: projectedPayoff,
        });

        toast.success(t('creditCardPayoff.toasts.calculationCompleted'), {
          description: t('creditCardPayoff.toasts.payoffPlanReady'),
        });
      } catch (error) {
        toast.error(t('creditCardPayoff.toasts.calculationFailed'), {
          description: t('creditCardPayoff.toasts.checkInputsAndRetry'),
        });
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
        toast.dismiss("credit-card-payoff-calculation");
      }
    }, 800);
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

  return (
    <CalculatorLayout
      title={t('creditCardPayoff.title')}
      description={t('creditCardPayoff.description')}
      icon={<CreditCard className="w-6 h-6 text-red-600" />}
    >
      <div className="space-y-8">
        {/* Debt Details */}
        <Card className="border-0 shadow-lg bg-gradient-to-br py-0 from-white to-red-50/30">
          <CardHeader className="bg-gradient-to-r py-3 from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <span>{t('creditCardPayoff.debtDetails.title')}</span>
            </CardTitle>
            <p className="text-red-100 text-sm font-normal mt-1">
              {t('creditCardPayoff.debtDetails.description')}
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
                    <span>{t('creditCardPayoff.debtDetails.balance.label')}</span>
                  </label>
                  <Input
                    type="number"
                    id="balance"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    placeholder={t('creditCardPayoff.debtDetails.balance.placeholder')}
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t('creditCardPayoff.debtDetails.balance.help')}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="annualInterestRate"
                    className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>{t('creditCardPayoff.debtDetails.annualInterestRate.label')}</span>
                  </label>
                  <Input
                    type="number"
                    id="annualInterestRate"
                    name="annualInterestRate"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange}
                    placeholder={t('creditCardPayoff.debtDetails.annualInterestRate.placeholder')}
                    step="0.01"
                    className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                  />
                  <p className="text-xs text-gray-500">
                    {t('creditCardPayoff.debtDetails.annualInterestRate.help')}
                  </p>
                </div>
              </div>

              {/* Payment Approach Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <span>{t('creditCardPayoff.paymentApproach.title')}</span>
                </h3>
                
                <RadioGroup
                  value={formData.paymentApproach}
                  onValueChange={handleRadioChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly-payment" id="monthly-payment" />
                    <Label htmlFor="monthly-payment" className="text-sm font-medium text-gray-700">
                      {t('creditCardPayoff.paymentApproach.monthlyPayment.label')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payoff-timeline" id="payoff-timeline" />
                    <Label htmlFor="payoff-timeline" className="text-sm font-medium text-gray-700">
                      {t('creditCardPayoff.paymentApproach.payoffTimeline.label')}
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
                      <span>{t('creditCardPayoff.paymentApproach.monthlyPaymentAmount.label')}</span>
                    </label>
                    <Input
                      type="number"
                      id="monthlyPayment"
                      name="monthlyPayment"
                      value={formData.monthlyPayment}
                      onChange={handleInputChange}
                      placeholder={t('creditCardPayoff.paymentApproach.monthlyPaymentAmount.placeholder')}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-sm transition-all duration-200 text-lg font-medium"
                    />
                    <p className="text-xs text-gray-500">
                      {t('creditCardPayoff.paymentApproach.monthlyPaymentAmount.help')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="payoffMonths"
                      className="block text-sm font-semibold text-gray-800 flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{t('creditCardPayoff.paymentApproach.desiredPayoffTimeline.label')}</span>
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        id="payoffMonths"
                        name="payoffMonths"
                        value={formData.payoffMonths}
                        onChange={handleInputChange}
                        placeholder={t('creditCardPayoff.paymentApproach.desiredPayoffTimeline.placeholder')}
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
                          <SelectItem value="months">{t('creditCardPayoff.paymentApproach.desiredPayoffTimeline.units.months')}</SelectItem>
                          <SelectItem value="years">{t('creditCardPayoff.paymentApproach.desiredPayoffTimeline.units.years')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('creditCardPayoff.paymentApproach.desiredPayoffTimeline.help')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={calculatePayoff}
                  disabled={!isFormValid() || isCalculating}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('creditCardPayoff.calculatingButton')}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t('creditCardPayoff.calculateButton')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="py-0 border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="bg-gradient-to-r py-4 from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <TrendingDown className="w-6 h-6 text-yellow-300" />
                <span>{t('creditCardPayoff.results.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-red-600" />
                      <h3 className="font-semibold text-red-800">{t('creditCardPayoff.results.monthsToPayoff')}</h3>
                    </div>
                    <div className="text-2xl font-bold text-red-900">
                      {results.monthsToPayoff === 999 ? "∞" : results.monthsToPayoff}
                    </div>
                    <div className="text-sm text-red-600">
                      {results.monthsToPayoff === 999 ? t('creditCardPayoff.results.neverPaymentTooLow') : t('creditCardPayoff.results.timeToDebtFreedom')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">{t('creditCardPayoff.results.monthlyPayment')}</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(results.requiredMonthlyPayment)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {formData.paymentApproach === "monthly-payment" ? t('creditCardPayoff.results.yourPlannedPayment') : t('creditCardPayoff.results.requiredToMeetTimeline')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Percent className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">{t('creditCardPayoff.results.totalInterest')}</h3>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(results.totalInterest)}
                    </div>
                    <div className="text-sm text-orange-600">
                      {t('creditCardPayoff.results.interestCostOverPeriod')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">{t('creditCardPayoff.results.totalCost')}</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(results.totalCost)}
                    </div>
                    <div className="text-sm text-purple-600">
                      {t('creditCardPayoff.results.balancePlusInterest')}
                    </div>
                  </div>
                </div>

                {/* Payoff Timeline */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span>{t('creditCardPayoff.results.payoffTimeline')}</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">{t('creditCardPayoff.results.estimatedPayoffDate')}</h4>
                        <div className="text-xl font-bold text-green-600">{results.payoffDate}</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2">{t('creditCardPayoff.results.potentialSavings')}</h4>
                        <div className="text-xl font-bold text-blue-600">
                          {results.savings === "0" ? "N/A" : formatCurrency(results.savings)}
                        </div>
                        <div className="text-xs text-blue-600">
                          {t('creditCardPayoff.results.vsMinimumPayment')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payoff Progress Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span>{t('creditCardPayoff.results.balanceReduction')}</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.projectedPayoff}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value === 0) return "Start";
                            return `${value}m`;
                          }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value.toString()), t('creditCardPayoff.results.balanceReduction')]}
                          labelFormatter={(label) => {
                            if (label === 0) return "Starting Balance";
                            return t('creditCardPayoff.results.monthLabel', { month: label });
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stackId="1"
                          stroke="#ef4444" 
                          fill="#ef4444"
                          fillOpacity={0.6}
                          name={t('creditCardPayoff.results.balanceReduction')}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <span>{t('creditCardPayoff.results.monthlyBreakdown')}</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projectedPayoff}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value === 0) return "Start";
                            return `${value}m`;
                          }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'payment') {
                              return [formatCurrency(value.toString()), t('creditCardPayoff.results.totalPayment')];
                            } else if (name === 'principal') {
                              return [formatCurrency(value.toString()), t('creditCardPayoff.results.principal')];
                            } else if (name === 'interest') {
                              return [formatCurrency(value.toString()), t('creditCardPayoff.results.interest')];
                            }
                            return [formatCurrency(value.toString()), name];
                          }}
                          labelFormatter={(label) => {
                            if (label === 0) return "Starting Balance";
                            return t('creditCardPayoff.results.monthLabel', { month: label });
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="payment" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          name={t('creditCardPayoff.results.totalPayment')}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="principal" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          name={t('creditCardPayoff.results.principal')}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interest" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name={t('creditCardPayoff.results.interest')}
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
