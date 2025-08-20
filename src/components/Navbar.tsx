"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations();
  
  return (
    <nav className="bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between h-12">
          {/* Company Logo - Left Side */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Main Logo Circle */}
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              {/* Decorative Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
            </div>

            {/* Company Name with Enhanced Typography */}
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-xl tracking-wider leading-none">
                {t('navbar.companyName')}
              </span>
              <span className="text-gray-600 text-xs font-medium tracking-widest uppercase">
                {t('navbar.companyTagline')}
              </span>
            </div>
          </div>

          {/* Module Name - Center with Icons */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              {/* Main Title with Icons */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-gray-700" />
                </div>
                <h1 className="text-gray-900 font-bold text-lg md:text-xl lg:text-2xl tracking-wide">
                  {t('navbar.mainTitle')}
                </h1>
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gray-700" />
                </div>
              </div>

              {/* Subtitle with Icon */}
              <div className="flex items-center justify-center space-x-2">
                <PiggyBank className="w-3 h-3 text-gray-600" />
                <p className="text-gray-600 text-xs md:text-sm font-medium">
                  {t('navbar.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Language Switcher - Right Side */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
