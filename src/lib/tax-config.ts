export interface TaxBracket {
  max: number;
  rate: number;
  base: number;
}

export interface FilingStatus {
  single: TaxBracket[];
  "married-jointly": TaxBracket[];
  "married-separately": TaxBracket[];
  "head-of-household": TaxBracket[];
}

export interface StandardDeductions {
  single: number;
  "married-jointly": number;
  "married-separately": number;
  "head-of-household": number;
}

export interface TaxYearConfig {
  year: number;
  standardDeductions: StandardDeductions;
  socialSecurityLimit: number;
  socialSecurityRate: number;
  medicareRate: number;
  taxBrackets: FilingStatus;
}

export const TAX_CONFIG: TaxYearConfig[] = [
  {
    year: 2024,
    standardDeductions: {
      single: 14600,
      "married-jointly": 29200,
      "married-separately": 14600,
      "head-of-household": 21900,
    },
    socialSecurityLimit: 168600,
    socialSecurityRate: 0.062, // 6.2%
    medicareRate: 0.0145, // 1.45%
    taxBrackets: {
      single: [
        { max: 11600, rate: 0.10, base: 0 },
        { max: 47150, rate: 0.12, base: 1160 },
        { max: 100525, rate: 0.22, base: 5423 },
        { max: 191950, rate: 0.24, base: 17289 },
        { max: 243725, rate: 0.32, base: 39493 },
        { max: 609350, rate: 0.35, base: 64093 },
        { max: Infinity, rate: 0.37, base: 192123 },
      ],
      "married-jointly": [
        { max: 23200, rate: 0.10, base: 0 },
        { max: 94300, rate: 0.12, base: 2320 },
        { max: 201050, rate: 0.22, base: 10847 },
        { max: 383900, rate: 0.24, base: 34578 },
        { max: 487450, rate: 0.32, base: 78986 },
        { max: 731200, rate: 0.35, base: 128186 },
        { max: Infinity, rate: 0.37, base: 213486 },
      ],
      "married-separately": [
        { max: 11600, rate: 0.10, base: 0 },
        { max: 47150, rate: 0.12, base: 1160 },
        { max: 100525, rate: 0.22, base: 5423 },
        { max: 191950, rate: 0.24, base: 17289 },
        { max: 243725, rate: 0.32, base: 39493 },
        { max: 365600, rate: 0.35, base: 64093 },
        { max: Infinity, rate: 0.37, base: 96043 },
      ],
      "head-of-household": [
        { max: 16550, rate: 0.10, base: 0 },
        { max: 63100, rate: 0.12, base: 1655 },
        { max: 100500, rate: 0.22, base: 7206 },
        { max: 191950, rate: 0.24, base: 16430 },
        { max: 243700, rate: 0.32, base: 33690 },
        { max: 609350, rate: 0.35, base: 48784 },
        { max: Infinity, rate: 0.37, base: 156804 },
      ],
    },
  },
  {
    year: 2023,
    standardDeductions: {
      single: 13850,
      "married-jointly": 27700,
      "married-separately": 13850,
      "head-of-household": 20800,
    },
    socialSecurityLimit: 160200,
    socialSecurityRate: 0.062, // 6.2%
    medicareRate: 0.0145, // 1.45%
    taxBrackets: {
      single: [
        { max: 11000, rate: 0.10, base: 0 },
        { max: 44725, rate: 0.12, base: 1100 },
        { max: 95375, rate: 0.22, base: 5147 },
        { max: 182100, rate: 0.24, base: 16290 },
        { max: 231250, rate: 0.32, base: 37104 },
        { max: 578125, rate: 0.35, base: 105664 },
        { max: Infinity, rate: 0.37, base: 186601 },
      ],
      "married-jointly": [
        { max: 22000, rate: 0.10, base: 0 },
        { max: 89450, rate: 0.12, base: 2200 },
        { max: 190750, rate: 0.22, base: 10294 },
        { max: 364200, rate: 0.24, base: 32580 },
        { max: 462500, rate: 0.32, base: 74208 },
        { max: 693750, rate: 0.35, base: 105664 },
        { max: Infinity, rate: 0.37, base: 186601 },
      ],
      "married-separately": [
        { max: 11000, rate: 0.10, base: 0 },
        { max: 44725, rate: 0.12, base: 1100 },
        { max: 95375, rate: 0.22, base: 5147 },
        { max: 182100, rate: 0.24, base: 16290 },
        { max: 231250, rate: 0.32, base: 37104 },
        { max: 346875, rate: 0.35, base: 52832 },
        { max: Infinity, rate: 0.37, base: 93300 },
      ],
      "head-of-household": [
        { max: 15700, rate: 0.10, base: 0 },
        { max: 59850, rate: 0.12, base: 1570 },
        { max: 95350, rate: 0.22, base: 6868 },
        { max: 182100, rate: 0.24, base: 14678 },
        { max: 231250, rate: 0.32, base: 35444 },
        { max: 578100, rate: 0.35, base: 52832 },
        { max: Infinity, rate: 0.37, base: 174253 },
      ],
    },
  },
];

// Helper function to get tax config for a specific year
export const getTaxConfig = (year: number): TaxYearConfig => {
  const config = TAX_CONFIG.find(c => c.year === year);
  if (!config) {
    // Fallback to most recent year if requested year not found
    return TAX_CONFIG[0];
  }
  return config;
};

// Helper function to get current year config
export const getCurrentYearConfig = (): TaxYearConfig => {
  const currentYear = new Date().getFullYear();
  return getTaxConfig(currentYear);
};

// Helper function to calculate federal tax based on config
export const calculateFederalTax = (
  taxableIncome: number,
  filingStatus: keyof FilingStatus,
  year: number = new Date().getFullYear()
): number => {
  const config = getTaxConfig(year);
  const brackets = config.taxBrackets[filingStatus];
  
  if (taxableIncome <= 0) return 0;
  
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.base + (taxableIncome - (bracket.max === Infinity ? 0 : bracket.max)) * bracket.rate;
    }
  }
  
  return 0;
};

// Helper function to get standard deduction
export const getStandardDeduction = (
  filingStatus: keyof StandardDeductions,
  year: number = new Date().getFullYear()
): number => {
  const config = getTaxConfig(year);
  return config.standardDeductions[filingStatus];
};

// Helper function to get FICA tax rates
export const getFICARates = (year: number = new Date().getFullYear()) => {
  const config = getTaxConfig(year);
  return {
    socialSecurityLimit: config.socialSecurityLimit,
    socialSecurityRate: config.socialSecurityRate,
    medicareRate: config.medicareRate,
  };
};
