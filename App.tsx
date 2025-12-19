
import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import { getSpendingInsights } from './geminiService';
import { 
  PlusIcon, 
  LayoutDashboardIcon, 
  ListIcon, 
  LightbulbIcon,
  XIcon,
  DollarSignIcon
} from 'lucide-react';

const STORAGE_KEY = 'smart_expense_tracker_v1';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'insights'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Helper for Android haptics
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored expenses");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Expense) => {
    triggerHaptic();
    setExpenses(prev => [expense, ...prev]);
    setIsModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    triggerHaptic();
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const fetchInsights = useCallback(async () => {
    if (expenses.length === 0) {
      setInsights("Add some expenses to see AI insights!");
      return;
    }
    setLoadingInsights(true);
    try {
      const res = await getSpendingInsights(expenses);
      setInsights(res);
    } catch (err) {
      setInsights("Unable to fetch insights at this time.");
    } finally {
      setLoadingInsights(false);
    }
  }, [expenses]);

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchInsights();
    }
  }, [activeTab, fetchInsights]);

  const handleTabChange = (tab: 'dashboard' | 'list' | 'insights') => {
    triggerHaptic();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* App Bar - Material Design Style */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 pt-4 pb-3 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <DollarSignIcon className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                KharchaKhata
              </h1>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                Made for India 🇮🇳
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => { triggerHaptic(); setIsModalOpen(true); }}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-transform"
            aria-label="Add Expense"
          >
            <PlusIcon size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && <Dashboard expenses={expenses} />}
        {activeTab === 'list' && <ExpenseList expenses={expenses} onDelete={deleteExpense} />}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <LightbulbIcon className="text-amber-600" size={20} />
                </div>
                AI Smart Savings
              </h2>
              {loadingInsights ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-4/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.split('\n').filter(l => l.trim()).map((line, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <p className="text-slate-700 text-sm leading-relaxed font-medium">
                        {line.replace(/^[*-\s]+/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Android Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 pt-3 pb-6 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => handleTabChange('dashboard')} 
            icon={<LayoutDashboardIcon size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'list'} 
            onClick={() => handleTabChange('list')} 
            icon={<ListIcon size={24} />} 
            label="History" 
          />
          <NavButton 
            active={activeTab === 'insights'} 
            onClick={() => handleTabChange('insights')} 
            icon={<LightbulbIcon size={24} />} 
            label="Insights" 
          />
        </div>
      </nav>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
            <button 
              onClick={() => { triggerHaptic(); setIsModalOpen(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
            >
              <XIcon size={24} />
            </button>
            <AddExpenseModal onAdd={addExpense} />
          </div>
        </div>
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center flex-1 transition-all"
  >
    <div className={`transition-all duration-300 mb-1 ${active ? 'nav-active-bg text-blue-700' : 'text-slate-400'}`}>
      {icon}
    </div>
    <span className={`text-[11px] font-bold tracking-tight transition-colors ${active ? 'text-blue-700' : 'text-slate-400'}`}>
      {label}
    </span>
  </button>
);

export default App;
