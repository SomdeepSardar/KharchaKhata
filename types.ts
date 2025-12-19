
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
