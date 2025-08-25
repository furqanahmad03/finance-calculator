"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations();
  
  return (
    <nav className="bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-3 items-center justify-between h-12">
          {/* Manchster Image - Left Side */}
          <div className="flex items-center justify-start">
            <Image
              src="/Manchster.png"
              alt="Manchster"
              width={80}
              height={60}
              className="h-8 sm:h-10 md:h-10 w-auto"
            />
          </div>

          {/* Money Logo - Center */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center justify-center">
              <Image
                src="/money-logo.svg"
                alt="Money Logo"
                width={120}
                height={60}
                className="h-8 sm:h-10 md:h-10 w-auto"
              />
            </div>
          </div>

          {/* Language Switcher - Right Side */}
          <div className="flex items-center justify-end">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
