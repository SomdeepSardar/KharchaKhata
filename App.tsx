import React, { useState, useEffect, useCallback } from 'react';
import { Expense, AppSettings, M3_PALETTES } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import SettingsTab from './components/SettingsTab';
import { getSpendingInsights } from './geminiService';
import { triggerHaptic, getGlassClass } from './utils';
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

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  darkThemeType: 'regular',
  currency: 'INR',
  colorScheme: 'indigo',
  isM3Enabled: true,
  isGlassEnabled: true
};

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'insights' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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
    
    const containerOpacity = settings.darkThemeType === 'true' ? '0.05' : '0.1';
    root.style.setProperty('--m3-primary-container', settings.theme === 'dark' ? `rgba(255,255,255,${containerOpacity})` : palette.container);
    root.style.setProperty('--m3-on-primary-container', settings.theme === 'dark' ? '#fff' : palette.onContainer);

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

  const clearAllData = () => {
    if (window.confirm("Are you absolutely sure? This will delete all expenses and reset your settings permanently.")) {
      triggerHaptic();
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      setExpenses([]);
      setSettings(DEFAULT_SETTINGS);
      setActiveTab('dashboard');
    }
  };

  const handleRestoreData = (restoredExpenses: Expense[], restoredSettings: AppSettings) => {
    triggerHaptic();
    setExpenses(restoredExpenses);
    setSettings(restoredSettings);
    alert("Khata Records & Settings restored successfully!");
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

  const glassClass = getGlassClass(settings.isGlassEnabled);
  const currentPalette = M3_PALETTES[settings.colorScheme];

  // Lower opacity in dark mode to allow glassmorphism to show through
  const headerFooterBg = settings.theme === 'dark'
    ? (settings.darkThemeType === 'true' 
        ? (settings.isGlassEnabled ? 'bg-black/60' : 'bg-black') 
        : (settings.isGlassEnabled ? 'bg-[#0f1115]/60' : 'bg-[#0f1115]'))
    : (settings.isGlassEnabled ? 'bg-white/70' : 'bg-white');

  return (
    <div className={`min-h-screen transition-all duration-700 pb-28 text-slate-900 dark:text-slate-100 bg-[var(--app-bg)]`}>
      {/* App Bar */}
      <header className={`sticky top-0 z-40 px-4 pt-4 pb-3 border-b transition-all duration-300 ${
        settings.theme === 'dark' 
          ? (settings.darkThemeType === 'true' ? 'border-white/10' : 'border-white/10') 
          : 'border-slate-300 shadow-sm'
      } ${headerFooterBg} ${glassClass}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-all overflow-hidden ${
              !settings.customIcon && (settings.isM3Enabled ? currentPalette.bgClass + ' shadow-indigo-500/20' : 'bg-slate-800')
            }`}>
              {settings.customIcon ? (
                <img src={settings.customIcon} alt="App Icon" className="w-full h-full object-cover" />
              ) : (
                <WalletIcon className="text-white" size={22} />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter leading-none flex items-center">
                <span className="transition-colors duration-300" style={{ color: 'var(--m3-primary)' }}>Kharcha</span>
                <span className="text-black dark:text-white transition-colors duration-300">Khata</span>
              </h1>
              <span 
                className="text-[10px] font-black uppercase tracking-[0.2em] mt-1" 
                style={{ 
                  color: settings.theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontWeight: 900
                }}
              >
                Premium Finance
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                settings.theme === 'dark' ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-slate-800 border border-slate-200'
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
                : 'bg-white/95 border-slate-300 shadow-lg'
            } ${glassClass} shadow-sm`}>
              <h2 className="text-lg font-black flex items-center gap-2 mb-6 text-black dark:text-white">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl border border-amber-200 dark:border-amber-700/30">
                  <LightbulbIcon className="text-amber-700 dark:text-amber-400" size={20} />
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
                    <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                      settings.theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <p className="text-sm leading-relaxed font-bold opacity-100 text-black dark:text-slate-100">
                        {line.replace(/^[*-\s]+/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings} 
            setSettings={setSettings} 
            onClearData={clearAllData} 
            expenses={expenses}
            onRestoreData={handleRestoreData}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6 z-40 border-t transition-all duration-500 ${
        settings.theme === 'dark' 
          ? (settings.darkThemeType === 'true' ? 'border-white/10' : 'border-white/10') 
          : 'border-slate-300 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]'
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
        <div className={`fixed inset-0 bg-black/70 ${glassClass} flex items-end sm:items-center justify-center z-50`}>
          <div className={`w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-500 border transition-all ${
            settings.theme === 'dark' 
              ? (settings.darkThemeType === 'true' ? 'bg-black border-white/10' : 'bg-[#0f1115] border-white/10') 
              : 'bg-white border-slate-300'
          }`}>
            <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
            <button 
              onClick={() => { triggerHaptic(); setIsModalOpen(false); }}
              className="absolute top-6 right-6 p-2 text-slate-600 hover:text-black active:scale-90 transition-transform dark:text-slate-400 dark:hover:text-white"
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
    <div className={`transition-all duration-500 mb-1 flex items-center justify-center ${active ? 'nav-active-bg' : 'text-slate-600 dark:text-slate-400'}`}>
      {icon}
    </div>
    <span 
      className={`text-[10px] font-black tracking-tight transition-colors ${active ? 'dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
      style={active ? { color: 'var(--m3-primary)' } : {}}
    >
      {label}
    </span>
  </button>
);

export default App;