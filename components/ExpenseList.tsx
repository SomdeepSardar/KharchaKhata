
import React from 'react';
import { Expense, Category, AppSettings, Currency } from '../types';
import { Trash2Icon, ShoppingBagIcon, CoffeeIcon, HomeIcon, CarIcon, HeartIcon, FilmIcon, ZapIcon, DollarSignIcon, HelpCircleIcon, ListIcon } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  settings: AppSettings;
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥'
};

const CategoryIcon = ({ category, size = 20 }: { category: Category, size?: number }) => {
  switch (category) {
    case 'Food & Dining': return <CoffeeIcon size={size} className="text-orange-500" />;
    case 'Transport': return <CarIcon size={size} className="text-blue-500" />;
    case 'Housing': return <HomeIcon size={size} className="text-indigo-500" />;
    case 'Entertainment': return <FilmIcon size={size} className="text-purple-500" />;
    case 'Shopping': return <ShoppingBagIcon size={size} className="text-pink-500" />;
    case 'Health': return <HeartIcon size={size} className="text-red-500" />;
    case 'Utilities': return <ZapIcon size={size} className="text-yellow-500" />;
    case 'Income': return <DollarSignIcon size={size} className="text-emerald-500" />;
    default: return <HelpCircleIcon size={size} className="text-slate-500" />;
  }
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, settings }) => {
  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const glassClass = settings.isGlassEnabled ? 'backdrop-blur-xl' : '';

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in duration-1000">
        <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-[40px] mb-6 shadow-inner">
          <ListIcon size={64} className="opacity-20" />
        </div>
        <p className="text-lg font-black tracking-tight">No Khata Records</p>
        <p className="text-sm opacity-60">Log your first spending to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black tracking-tight">Timeline</h2>
        <span className="text-[10px] font-black text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-widest">
          {expenses.length} Records
        </span>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className={`group flex items-center gap-5 p-5 rounded-[28px] border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              settings.theme === 'dark' 
                ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60' 
                : 'bg-white/70 border-white hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
            } ${glassClass}`}
          >
            <div className={`p-4 rounded-2xl shadow-sm transition-all ${
              settings.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
            }`}>
              <CategoryIcon category={expense.category} size={28} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-md truncate tracking-tight">{expense.merchant}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {expense.category} • {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
              <p className={`font-black text-lg tracking-tighter ${
                expense.category === 'Income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
              }`}>
                {expense.category === 'Income' ? '+' : '-'}{symbol}{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <button 
                onClick={() => onDelete(expense.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg translate-x-2 group-hover:translate-x-0"
              >
                <Trash2Icon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
