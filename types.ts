
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

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type M3ColorScheme = 'indigo' | 'emerald' | 'rose' | 'amber';

export interface AppSettings {
  theme: 'light' | 'dark';
  darkThemeType: 'regular' | 'true';
  currency: Currency;
  colorScheme: M3ColorScheme;
  isM3Enabled: boolean;
  isGlassEnabled: boolean;
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
