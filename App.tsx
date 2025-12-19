import React, { useState, useEffect, useCallback } from 'react';
import { Expense, AppSettings, M3ColorScheme } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import SettingsTab from './components/SettingsTab';
import { getSpendingInsights } from './geminiService';
import { 
  PlusIcon, 
  LayoutDashboardIcon, 
  ListIcon, 
  LightbulbIcon,
  XIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  WalletIcon
} from 'lucide-react';

const STORAGE_KEY = 'kharcha_khata_v2_data';
const SETTINGS_KEY = 'kharcha_khata_v2_settings';

const M3_PALETTES: Record<M3ColorScheme, { 
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

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'insights' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    darkThemeType: 'regular',
    currency: 'INR',
    colorScheme: 'indigo',
    isM3Enabled: true,
    isGlassEnabled: true
  });

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedData) setExpenses(JSON.parse(storedData));
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Apply Theme Engine
    const root = document.documentElement;
    const palette = M3_PALETTES[settings.colorScheme];
    root.style.setProperty('--m3-primary', palette.primary);
    
    // OLED / True black container adjustments
    const containerOpacity = settings.darkThemeType === 'true' ? '0.05' : '0.1';
    root.style.setProperty('--m3-primary-container', settings.theme === 'dark' ? `rgba(255,255,255,${containerOpacity})` : palette.container);
    root.style.setProperty('--m3-on-primary-container', settings.theme === 'dark' ? '#fff' : palette.onContainer);

    // Subtle Background Calculation
    let bgColor = palette.subtleLight;
    if (settings.theme === 'dark') {
      bgColor = settings.darkThemeType === 'true' ? '#000000' : palette.subtleDark;
      root.classList.add('dark');
      if (settings.darkThemeType === 'true') {
        root.classList.add('true-dark');
      } else {
        root.classList.remove('true-dark');
      }
    } else {
      root.classList.remove('dark');
      root.classList.remove('true-dark');
    }
    
    root.style.setProperty('--app-bg', bgColor);
  }, [settings]);

  const addExpense = (expense: Expense) => {
    triggerHaptic();
    setExpenses(prev => [expense, ...prev]);
    setIsModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    triggerHaptic();
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleTabChange = (tab: 'dashboard' | 'list' | 'insights' | 'settings') => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const toggleTheme = () => {
    triggerHaptic();
    setSettings(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
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
    if (activeTab === 'insights') fetchInsights();
  }, [activeTab, fetchInsights]);

  const glassClass = settings.isGlassEnabled ? 'backdrop-blur-2xl backdrop-saturate-150 backdrop-contrast-[1.1]' : '';
  const currentPalette = M3_PALETTES[settings.colorScheme];

  // Increased opacity for light mode footer to ensure visibility
  const headerFooterBg = settings.theme === 'dark'
    ? (settings.darkThemeType === 'true' ? 'bg-black/40' : 'bg-white/5')
    : 'bg-white/85';

  return (
    <div className={`min-h-screen transition-all duration-700 pb-28 text-slate-900 dark:text-slate-100 bg-[var(--app-bg)]`}>
      {/* App Bar */}
      <header className={`sticky top-0 z-30 px-4 pt-4 pb-3 border-b transition-all duration-300 ${
        settings.theme === 'dark' 
          ? (settings.darkThemeType === 'true' ? 'border-white/5' : 'border-white/10') 
          : 'border-black/5'
      } ${headerFooterBg} ${glassClass}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              settings.isM3Enabled ? currentPalette.bgClass + ' shadow-indigo-500/30' : 'bg-slate-800'
            }`}>
              <WalletIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">KharchaKhata</h1>
              <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-0.5" style={{ color: currentPalette.primary }}>Premium Finance</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                settings.theme === 'dark' ? 'bg-white/5 text-amber-400' : 'bg-black/5 text-slate-600'
              }`}
            >
              {settings.theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <button 
              onClick={() => { triggerHaptic(); setIsModalOpen(true); }}
              className={`p-2.5 rounded-2xl shadow-lg transition-all active:scale-90 ${
                settings.isM3Enabled ? currentPalette.bgClass + ' text-white shadow-indigo-500/40' : 'bg-slate-900 text-white'
              }`}
            >
              <PlusIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'dashboard' && <Dashboard expenses={expenses} settings={settings} />}
        {activeTab === 'list' && <ExpenseList expenses={expenses} settings={settings} onDelete={deleteExpense} />}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-[32px] border transition-all ${
              settings.theme === 'dark' 
                ? (settings.darkThemeType === 'true' ? 'bg-white/5 border-white/5' : 'bg-white/5 border-white/10') 
                : 'bg-white/40 border-black/5'
            } ${glassClass} shadow-sm`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                  <LightbulbIcon className="text-amber-600" size={20} />
                </div>
                AI Smart Savings
              </h2>
              {loadingInsights ? (
                <div className="space-y-4">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full w-4/6 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.split('\n').filter(l => l.trim()).map((line, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <p className="text-sm leading-relaxed font-medium opacity-90">
                        {line.replace(/^[*-\s]+/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings} />}
      </main>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6 z-40 border-t transition-all duration-500 ${
        settings.theme === 'dark' 
          ? (settings.darkThemeType === 'true' ? 'border-white/5' : 'border-white/10') 
          : 'border-black/5'
      } ${headerFooterBg} ${glassClass}`}>
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
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => handleTabChange('settings')} 
            icon={<SettingsIcon size={24} />} 
            label="Settings" 
          />
        </div>
      </nav>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className={`fixed inset-0 bg-black/40 ${glassClass} flex items-end sm:items-center justify-center z-50`}>
          <div className={`w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-500 border transition-all ${
            settings.theme === 'dark' 
              ? (settings.darkThemeType === 'true' ? 'bg-black border-white/10' : 'bg-[#0f1115] border-white/10') 
              : 'bg-white border-black/5'
          }`}>
            <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
            <button 
              onClick={() => { triggerHaptic(); setIsModalOpen(false); }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
            >
              <XIcon size={24} />
            </button>
            <AddExpenseModal onAdd={addExpense} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center flex-1 transition-all">
    <div className={`transition-all duration-500 mb-1 flex items-center justify-center ${active ? 'nav-active-bg' : 'text-slate-500 dark:text-slate-400'}`}>
      {icon}
    </div>
    <span 
      className={`text-[10px] font-bold tracking-tight transition-colors ${active ? 'dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
      style={active ? { color: 'var(--m3-primary)' } : {}}
    >
      {label}
    </span>
  </button>
);

export default App;