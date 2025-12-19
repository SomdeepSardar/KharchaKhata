import React, { useState, useRef } from 'react';
import { AppSettings, Currency, M3ColorScheme, Expense } from '../types';
import { generateAppIcon } from '../geminiService';
import { 
  PaletteIcon, 
  SparklesIcon, 
  LayersIcon,
  RefreshCwIcon,
  CheckIcon,
  MoonStarIcon,
  CheckCircleIcon,
  Trash2Icon,
  AlertTriangleIcon,
  DownloadIcon,
  UploadIcon
} from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  setSettings: (s: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  onClearData: () => void;
  expenses: Expense[];
  onRestoreData: (expenses: Expense[], settings: AppSettings) => void;
}

const PALETTES: { id: M3ColorScheme; color: string; label: string }[] = [
  { id: 'indigo', color: '#4f46e5', label: 'Indigo' },
  { id: 'emerald', color: '#059669', label: 'Emerald' },
  { id: 'rose', color: '#e11d48', label: 'Rose' },
  { id: 'amber', color: '#d97706', label: 'Amber' }
];

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings, onClearData, expenses, onRestoreData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempIcon, setTempIcon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (url) {
      setTempIcon(url);
    }
    setIsGenerating(false);
  };

  const applyIcon = () => {
    if (tempIcon) {
      setSettings(prev => ({ ...prev, customIcon: tempIcon }));
      setTempIcon(null);
      if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
    }
  };

  const toggleM3 = () => setSettings(prev => ({ ...prev, isM3Enabled: !prev.isM3Enabled }));
  const toggleGlass = () => setSettings(prev => ({ ...prev, isGlassEnabled: !prev.isGlassEnabled }));
  const toggleTrueDark = () => setSettings(prev => ({ 
    ...prev, 
    darkThemeType: prev.darkThemeType === 'true' ? 'regular' : 'true' 
  }));

  const handleExport = () => {
    const data = {
      expenses,
      settings,
      exportDate: new Date().toISOString(),
      version: "2.2.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KharchaKhata_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.expenses && parsed.settings) {
          if (window.confirm("Restoring this backup will overwrite your current Khata records and settings. Continue?")) {
            onRestoreData(parsed.expenses, parsed.settings);
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse the backup file.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  const glassClass = settings.isGlassEnabled ? 'backdrop-blur-3xl saturate-150' : '';
  
  const cardBg = settings.theme === 'dark' 
    ? (settings.darkThemeType === 'true' 
        ? (settings.isGlassEnabled ? 'bg-black/40 border-white/20' : 'bg-black border-white/10') 
        : (settings.isGlassEnabled ? 'bg-slate-900/50 border-white/10' : 'bg-slate-900 border-slate-800/50')) 
    : 'bg-white border-slate-300 shadow-xl';

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className={`p-8 rounded-[40px] border transition-all ${cardBg} ${glassClass}`}>
        <h2 className="text-2xl font-black mb-8 text-black dark:text-white tracking-tight">App Architecture</h2>

        <div className="space-y-8">
          {/* Appearance Section */}
          <section className="space-y-5">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em] ml-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-fit">Interface Aesthetics</h3>
            
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm" onClick={toggleM3}>
              <div className="flex items-center gap-5">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl border border-blue-200 dark:border-blue-700/30">
                  <PaletteIcon className="text-blue-700 dark:text-blue-400" size={22} />
                </div>
                <div>
                  <p className="font-black text-[15px] text-black dark:text-slate-100">Material 3 Scheme</p>
                  <p className="text-xs text-slate-800 dark:text-slate-400 font-bold opacity-80">Dynamic unified coloration</p>
                </div>
              </div>
              <div className={`w-14 h-7 rounded-full transition-all relative ${settings.isM3Enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.isM3Enabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {settings.theme === 'dark' && (
              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm" onClick={toggleTrueDark}>
                <div className="flex items-center gap-5">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-xl border border-amber-200 dark:border-amber-700/30">
                    <MoonStarIcon className="text-amber-700 dark:text-amber-400" size={22} />
                  </div>
                  <div>
                    <p className="font-black text-[15px] text-black dark:text-slate-100">True OLED Black</p>
                    <p className="text-xs text-slate-800 dark:text-slate-400 font-bold opacity-80">Zero-emission pixels</p>
                  </div>
                </div>
                <div className={`w-14 h-7 rounded-full transition-all relative ${settings.darkThemeType === 'true' ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.darkThemeType === 'true' ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm" onClick={toggleGlass}>
              <div className="flex items-center gap-5">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-700/30">
                  <LayersIcon className="text-indigo-700 dark:text-indigo-400" size={22} />
                </div>
                <div>
                  <p className="font-black text-[15px] text-black dark:text-slate-100">Glassmorphism</p>
                  <p className="text-xs text-slate-800 dark:text-slate-400 font-bold opacity-80">Volumetric translucency</p>
                </div>
              </div>
              <div className={`w-14 h-7 rounded-full transition-all relative ${settings.isGlassEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.isGlassEnabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          </section>

          {/* Accent Color Selection */}
          <section className="space-y-5">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em] ml-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-fit">Primary Accent</h3>
            <div className="flex gap-5 px-1">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSettings(s => ({ ...s, colorScheme: p.id }))}
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all ${
                    settings.colorScheme === p.id 
                      ? 'border-black dark:border-white scale-110 shadow-2xl' 
                      : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                >
                  {settings.colorScheme === p.id && <CheckIcon className="text-white drop-shadow-md" size={24} />}
                </button>
              ))}
            </div>
          </section>

          {/* Regional Section */}
          <section className="space-y-5 pt-4">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em] ml-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-fit">Localization</h3>
            <div className="bg-slate-100 dark:bg-white/10 p-2 rounded-[24px] flex flex-wrap gap-1.5 border border-slate-200 dark:border-white/10">
              {currencies.map(curr => (
                <button
                  key={curr.val}
                  onClick={() => setSettings(s => ({ ...s, currency: curr.val }))}
                  className={`flex-1 py-4 px-3 rounded-xl text-[13px] font-black transition-all ${
                    settings.currency === curr.val 
                      ? 'bg-white dark:bg-white/20 shadow-md text-blue-700 dark:text-blue-400' 
                      : 'text-slate-700 dark:text-slate-300 opacity-60 hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  {curr.val}
                </button>
              ))}
            </div>
          </section>

          {/* Data Management Section */}
          <section className="space-y-5 pt-4">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em] ml-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-fit">Storage & Integrity</h3>
            <div className="flex gap-4">
              <button 
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.97] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm"
              >
                <DownloadIcon size={20} />
                Snapshot Records
              </button>
              <button 
                onClick={handleImportClick}
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.97] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shadow-sm"
              >
                <UploadIcon size={20} />
                Restore Records
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange} 
              />
            </div>
          </section>

          {/* AI Lab Section */}
          <section className="space-y-5 pt-4">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em] ml-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-fit">Neural Laboratory</h3>
            <div className={`p-7 rounded-[32px] text-white shadow-2xl transition-all relative overflow-hidden ${
              settings.darkThemeType === 'true' ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-white/10' : 'bg-gradient-to-br from-indigo-600 to-purple-800'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <SparklesIcon size={22} className="text-amber-300" />
                <h4 className="font-black text-base">NanoBanana Branding</h4>
              </div>
              <p className="text-xs text-indigo-50 font-bold mb-8 leading-relaxed relative z-10 opacity-90">Synthesize a custom procedural icon for your financial instance using Gemini Generative Vision.</p>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-xl">
                  {tempIcon || settings.customIcon ? (
                    <img src={tempIcon || settings.customIcon} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <RefreshCwIcon className={`text-white/60 ${isGenerating ? 'animate-spin' : ''}`} size={32} />
                  )}
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <button 
                    disabled={isGenerating}
                    onClick={handleIconGen}
                    className="bg-white/30 hover:bg-white/40 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border border-white/20"
                  >
                    <RefreshCwIcon size={16} className={isGenerating ? 'animate-spin' : ''} />
                    {isGenerating ? 'Synthesizing...' : 'Regenerate'}
                  </button>
                  {tempIcon && (
                    <button 
                      onClick={applyIcon}
                      className="bg-white text-indigo-700 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                    >
                      <CheckCircleIcon size={16} />
                      Commit Icon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone Section */}
          <section className="space-y-5 pt-6 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-[11px] font-black text-rose-700 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <AlertTriangleIcon size={14} />
              Protocol Override
            </h3>
            <div className={`p-6 rounded-[32px] border transition-all ${
              settings.theme === 'dark' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200 shadow-inner'
            }`}>
              <p className="text-[12px] font-black text-rose-800 dark:text-rose-400 mb-5 leading-relaxed">
                ERASE PROTOCOL: This action is irreversible. All persistent ledger data and personalization nodes will be purged.
              </p>
              <button 
                onClick={onClearData}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-lg shadow-rose-600/30"
              >
                <Trash2Icon size={18} />
                Wipe Local Storage
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Developer Credit Footer */}
      <div className="text-center pb-20 pt-8 px-4">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-slate-900 dark:text-white opacity-40">
          BUILD 2.2.0 "ULTRA-CONTRAST"
        </p>
        <div className="flex flex-col items-center gap-3 bg-slate-100 dark:bg-white/5 py-8 rounded-[40px] border border-slate-200 dark:border-white/10">
          <p className="text-[12px] font-black text-slate-800 dark:text-slate-400 flex items-center gap-2">
            Architected in India by
          </p>
          <div className="flex items-center gap-2">
             <p className="text-2xl font-black tracking-tighter" style={{ color: 'var(--m3-primary)' }}>
               DarkClaw
             </p>
             <span className="text-2xl">❤️</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 tracking-[0.2em] mt-2 uppercase">Global Finance Standard</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;