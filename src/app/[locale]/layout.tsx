import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export const metadata: Metadata = {
  title: "Finance Calculator",
  description: "Comprehensive financial calculators for smart money decisions",
};

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const messages = await getMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative z-50">
        <Navbar />
      </div>
      <div className="relative">
        {children}
      </div>
      <div className="relative">
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
