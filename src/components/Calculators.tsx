"use client";

import { useState } from "react";
import { 
  Car, 
  Target, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  PiggyBank 
} from "lucide-react";

// Import dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import calculator interface
import { Calculator } from "@/interfaces/calculator";

// Import all calculator components
import CarCalculator from "./CarCalculator";
import SaveMillion from "./SaveMillion";
import SaveForGoal from "./SaveForGoal";
import SavingsGrow from "./SavingsGrow";
import PayCheck from "./PayCheck";
import CreditCardPayoff from "./CreditCardPayoff";

const calculators: Calculator[] = [
  {
    id: "car",
    title: "Car Calculator",
    description: "Calculate car loan payments, interest, and total cost",
    icon: <Car className="w-8 h-8 text-blue-600" />,
    component: CarCalculator,
  },
  {
    id: "save-million",
    title: "Save Million",
    description: "Plan your path to saving one million dollars",
    icon: <Target className="w-8 h-8 text-green-600" />,
    component: SaveMillion,
  },
  {
    id: "save-goal",
    title: "Save for Goal",
    description: "Calculate how much to save for specific financial goals",
    icon: <PiggyBank className="w-8 h-8 text-purple-600" />,
    component: SaveForGoal,
  },
  {
    id: "savings-grow",
    title: "Savings Growth",
    description: "See how your savings grow with compound interest",
    icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
    component: SavingsGrow,
  },
  {
    id: "paycheck",
    title: "Paycheck Calculator",
    description: "Calculate take-home pay after taxes and deductions",
    icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
    component: PayCheck,
  },
  {
    id: "credit-card",
    title: "Credit Card Payoff",
    description: "Plan your credit card debt payoff strategy",
    icon: <CreditCard className="w-8 h-8 text-red-600" />,
    component: CreditCardPayoff,
  },
];

export default function Calculators() {
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCalculatorClick = (calculatorId: string) => {
    setSelectedCalculator(calculatorId);
    setIsDialogOpen(true);
  };

  const selectedCalc = selectedCalculator ? calculators.find(calc => calc.id === selectedCalculator) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Financial Calculators
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive suite of financial tools to help you make informed decisions about your money
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calculator) => (
            <div
              key={calculator.id}
              onClick={() => handleCalculatorClick(calculator.id)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-gray-200"
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {calculator.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {calculator.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {calculator.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Click to Open
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculator Dialog */}
        {selectedCalc && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="min-w-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3 text-left">
                  {selectedCalc.icon}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCalc.title}</h2>
                    <p className="text-gray-600 text-base font-normal">{selectedCalc.description}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-6">
                <selectedCalc.component />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
