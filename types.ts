export type Category = 
  | 'Food & Dining'
  | 'Transport'
  | 'Housing'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Utilities'
  | 'Income'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Income', 'Other'
];

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥'
};

export type M3ColorScheme = 'indigo' | 'emerald' | 'rose' | 'amber';

export interface AppSettings {
  theme: 'light' | 'dark';
  darkThemeType: 'regular' | 'true';
  currency: Currency;
  colorScheme: M3ColorScheme;
  isM3Enabled: boolean;
  isGlassEnabled: boolean;
  customIcon?: string;
}

export interface Expense {
  id: string;
  amount: number;
  merchant: string;
  category: Category;
  date: string;
  description?: string;
}

export interface Budget {
  category: Category;
  amount: number;
}

export interface Insight {
  title: string;
  content: string;
  type: 'warning' | 'positive' | 'info';
}

export const M3_PALETTES: Record<M3ColorScheme, { 
  primary: string, 
  container: string, 
  onContainer: string, 
  bgClass: string,
  subtleLight: string,
  subtleDark: string
}> = {
  indigo: { 
    primary: '#4f46e5', 
    container: '#e0e7ff', 
    onContainer: '#312e81', 
    bgClass: 'bg-indigo-600',
    subtleLight: '#f5f7ff',
    subtleDark: '#030712'
  },
  emerald: { 
    primary: '#059669', 
    container: '#d1fae5', 
    onContainer: '#064e3b', 
    bgClass: 'bg-emerald-600',
    subtleLight: '#f0fdf4',
    subtleDark: '#010504'
  },
  rose: { 
    primary: '#e11d48', 
    container: '#ffe4e6', 
    onContainer: '#881337', 
    bgClass: 'bg-rose-600',
    subtleLight: '#fff1f2',
    subtleDark: '#050102'
  },
  amber: { 
    primary: '#d97706', 
    container: '#fef3c7', 
    onContainer: '#78350f', 
    bgClass: 'bg-amber-600',
    subtleLight: '#fffbeb',
    subtleDark: '#050301'
  }
};
