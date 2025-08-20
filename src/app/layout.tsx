import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Calculator",
  description: "Comprehensive financial calculators for smart money decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
