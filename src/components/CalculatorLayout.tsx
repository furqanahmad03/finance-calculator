"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorLayoutProps } from "@/interfaces/calculator";

export default function CalculatorLayout({
  title,
  description,
  icon,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calculator Header */}
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
            <div>
              <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calculator Content */}
          <div className="space-y-4">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
