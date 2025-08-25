"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react"

// Import dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import all calculator components
import CarCalculator from "./CarCalculator";
import SaveMillion from "./SaveMillion";
import SaveForGoal from "./SaveForGoal";
import SavingsGrow from "./SavingsGrow";
import PayCheck from "./PayCheck";
import CreditCardPayoff from "./CreditCardPayoff";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations();
  
  // Calculate current year on the server side
  const currentYear = new Date().getFullYear();

  // Calculator state management (same as Calculators component)
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calculators = [
    {
      id: "savings-grow",
      title: t('footer.savingsGrowthCalculator'),
      component: SavingsGrow,
    },
    {
      id: "paycheck",
      title: t('footer.paycheckCalculator'),
      component: PayCheck,
    },
    {
      id: "credit-card",
      title: t('footer.creditCardPayoff'),
      component: CreditCardPayoff,
    },
    {
      id: "save-goal",
      title: t('footer.saveForGoal'),
      component: SaveForGoal,
    },
    {
      id: "save-million",
      title: t('footer.saveAMillion'),
      component: SaveMillion,
    },
    {
      id: "car",
      title: t('footer.carCalculator'),
      component: CarCalculator,
    },
  ];

  const handleCalculatorClick = (calculatorId: string) => {
    setSelectedCalculator(calculatorId);
    setIsDialogOpen(true);
  };

  const selectedCalc = selectedCalculator ? calculators.find(calc => calc.id === selectedCalculator) : null;

  return (
    <>
      <footer className="bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-800 border-t border-gray-200">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image src="/Manchster.png" alt="Manchster" width={120} height={100} />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('footer.companyDescription')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Available Calculators */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">{t('footer.availableCalculators')}</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCalculatorClick('savings-grow')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.savingsGrowthCalculator')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCalculatorClick('paycheck')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.paycheckCalculator')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCalculatorClick('credit-card')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.creditCardPayoff')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCalculatorClick('save-goal')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.saveForGoal')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCalculatorClick('save-million')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.saveAMillion')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCalculatorClick('car')}
                    className="text-gray-600 text-sm hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    {t('footer.carCalculator')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">{t('footer.contactUs')}</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 text-sm">{t('footer.email')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 text-sm">{t('footer.phone')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 text-sm">{t('footer.address')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <span>{t('footer.copyright', { year: currentYear })}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 text-sm">
                <span>{t('footer.madeWith')}</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>{t('footer.forYou')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Calculator Dialog (same as Calculators component) */}
      {selectedCalc && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="min-w-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 text-left">
                {selectedCalc.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-6 max-w-7xl mx-auto">
              <selectedCalc.component />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
