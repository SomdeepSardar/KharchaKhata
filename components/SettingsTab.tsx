
import React, { useState } from 'react';
import { AppSettings, Currency, M3ColorScheme } from '../types';
import { generateAppIcon } from '../geminiService';
import { 
  PaletteIcon, 
  SparklesIcon, 
  LayersIcon,
  RefreshCwIcon,
  CheckIcon,
  MoonStarIcon
} from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  setSettings: (s: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const PALETTES: { id: M3ColorScheme; color: string; label: string }[] = [
  { id: 'indigo', color: '#4f46e5', label: 'Indigo' },
  { id: 'emerald', color: '#059669', label: 'Emerald' },
  { id: 'rose', color: '#e11d48', label: 'Rose' },
  { id: 'amber', color: '#d97706', label: 'Amber' }
];

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currencies: { val: Currency; label: string }[] = [
    { val: 'INR', label: 'INR' },
    { val: 'USD', label: 'USD' },
    { val: 'EUR', label: 'EUR' },
    { val: 'GBP', label: 'GBP' },
    { val: 'JPY', label: 'JPY' },
  ];

  const handleIconGen = async () => {
    setIsGenerating(true);
    const url = await generateAppIcon();
    setIconUrl(url);
    setIsGenerating(false);
  };

  const toggleM3 = () => setSettings(prev => ({ ...prev, isM3Enabled: !prev.isM3Enabled }));
  const toggleGlass = () => setSettings(prev => ({ ...prev, isGlassEnabled: !prev.isGlassEnabled }));
  const toggleTrueDark = () => setSettings(prev => ({ 
    ...prev, 
    darkThemeType: prev.darkThemeType === 'true' ? 'regular' : 'true' 
  }));

  const glassClass = settings.isGlassEnabled ? 'backdrop-blur-2xl backdrop-saturate-150' : '';
  
  // Conditional card backgrounds based on dark mode type
  const cardBg = settings.theme === 'dark' 
    ? (settings.darkThemeType === 'true' ? 'bg-white/5 border-white/10' : 'bg-slate-900/40 border-slate-800/50') 
    : 'bg-white/40 border-white/50';

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className={`p-6 rounded-[32px] border transition-all ${cardBg} ${glassClass} shadow-sm`}>
        <h2 className="text-xl font-black mb-6">App Settings</h2>

        <div className="space-y-6">
          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Appearance</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/30 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer" onClick={toggleM3}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                  <PaletteIcon className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Material 3 Scheme</p>
                  <p className="text-[11px] text-slate-500">Dynamic system colors</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all relative ${settings.isM3Enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isM3Enabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {/* True Dark Mode Toggle (Conditional) */}
            {settings.theme === 'dark' && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/30 dark:bg-white/5 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer" onClick={toggleTrueDark}>
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl">
                    <MoonStarIcon className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">True OLED Dark</p>
                    <p className="text-[11px] text-slate-500">Pure black for OLED</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all relative ${settings.darkThemeType === 'true' ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.darkThemeType === 'true' ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/30 dark:bg-white/5 border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer" onClick={toggleGlass}>
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                  <LayersIcon className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Glassmorphism</p>
                  <p className="text-[11px] text-slate-500">Enable frosted effects</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all relative ${settings.isGlassEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isGlassEnabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          </section>

          {/* Accent Color Selection */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accent Color</h3>
            <div className="flex gap-4 px-1">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSettings(s => ({ ...s, colorScheme: p.id }))}
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                    settings.colorScheme === p.id ? 'border-white dark:border-white/20 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                >
                  {settings.colorScheme === p.id && <CheckIcon className="text-white" size={20} />}
                </button>
              ))}
            </div>
          </section>

          {/* Currency Selection */}
          <section className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regional</h3>
            <div className="bg-slate-100/30 dark:bg-white/5 p-1.5 rounded-2xl flex flex-wrap gap-1">
              {currencies.map(curr => (
                <button
                  key={curr.val}
                  onClick={() => setSettings(s => ({ ...s, currency: curr.val }))}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all ${
                    settings.currency === curr.val 
                      ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' 
                      : 'text-slate-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  {curr.val}
                </button>
              ))}
            </div>
          </section>

          {/* AI Lab Section */}
          <section className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Lab</h3>
            <div className={`p-6 rounded-[24px] text-white shadow-lg shadow-indigo-500/10 transition-colors ${
              settings.darkThemeType === 'true' ? 'bg-gradient-to-br from-indigo-900 to-black border border-white/5' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon size={20} className="text-amber-300" />
                <h4 className="font-black text-sm">NanoBanana Icon Gen</h4>
              </div>
              <p className="text-xs text-indigo-100 mb-6 leading-relaxed">Create a custom premium icon for KharchaKhata using Gemini Flash Image.</p>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden">
                  {iconUrl ? (
                    <img src={iconUrl} className="w-full h-full object-cover" />
                  ) : (
                    <RefreshCwIcon className={`text-white/40 ${isGenerating ? 'animate-spin' : ''}`} size={24} />
                  )}
                </div>
                <button 
                  disabled={isGenerating}
                  onClick={handleIconGen}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Developer Credit Footer */}
      <div className="text-center pb-16 pt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8 dark:opacity-20">
          Version 2.2.0 "Darker Mode"
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 opacity-80">
            Made with love from 🇮🇳 by
          </p>
          <p 
            className="text-lg font-black tracking-tighter"
            style={{ color: 'var(--m3-primary)' }}
          >
            DarkClaw ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
