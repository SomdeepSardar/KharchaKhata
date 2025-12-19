
import React from 'react';
import { Expense, Category } from '../types';
import { Trash2Icon, ShoppingBagIcon, CoffeeIcon, HomeIcon, CarIcon, HeartIcon, FilmIcon, ZapIcon, DollarSignIcon, HelpCircleIcon, ListIcon } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CategoryIcon = ({ category, size = 18 }: { category: Category, size?: number }) => {
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

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <ListIcon size={48} />
        </div>
        <p className="text-lg font-medium">No expenses recorded yet</p>
        <p className="text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all hover:shadow-md"
          >
            <div className="bg-slate-50 p-3 rounded-xl">
              <CategoryIcon category={expense.category} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 truncate">{expense.merchant}</h4>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                {expense.category} • {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${expense.category === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                {expense.category === 'Income' ? '+' : '-'}₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <button 
                onClick={() => onDelete(expense.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
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
