
import React, { useMemo } from 'react';
import { Expense, AppSettings, Currency } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  settings: AppSettings;
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥'
};

const Dashboard: React.FC<DashboardProps> = ({ expenses, settings }) => {
  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const glassClass = settings.isGlassEnabled ? 'backdrop-blur-2xl backdrop-saturate-150 border-white/20 dark:border-white/10' : '';
  
  // Adjusted backgrounds for OLED mode
  const cardBg = settings.theme === 'dark' 
    ? (settings.darkThemeType === 'true' ? 'bg-white/5' : 'bg-slate-900/40') 
    : 'bg-white/40';

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const barData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      amount: expenses
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0)
    }));

    return { total, pieData, barData };
  }, [expenses]);

  const mainCardBg = settings.theme === 'dark' 
    ? (settings.darkThemeType === 'true' ? 'linear-gradient(135deg, #111111 0%, #000000 100%)' : 'linear-gradient(135deg, #0f172a 0%, #020617 100%)') 
    : 'var(--m3-primary)';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Balance Card */}
      <div className="p-8 rounded-[40px] shadow-2xl relative overflow-hidden border transition-all duration-700 border-white/5" style={{ background: mainCardBg }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl" />
        
        <p className="font-black uppercase tracking-[0.2em] text-[10px] mb-4 opacity-70 text-white/80">Total Liquidity Used</p>
        
        <h2 className="text-5xl font-black tracking-tighter mb-8 flex items-baseline text-white">
          <span className="text-3xl font-medium opacity-60 mr-1">{symbol}</span>
          {stats.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-2xl opacity-40 font-medium tracking-tight">.{stats.total.toFixed(2).split('.')[1]}</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`px-5 py-4 rounded-[24px] border transition-all bg-white/10 border-white/10 ${glassClass}`}>
            <p className="text-[10px] opacity-60 uppercase font-black tracking-widest mb-1 text-white">Receipts</p>
            <p className="text-xl font-black text-white">{expenses.length}</p>
          </div>
          <div className={`px-5 py-4 rounded-[24px] border transition-all bg-white/10 border-white/10 ${glassClass}`}>
            <p className="text-[10px] opacity-60 uppercase font-black tracking-widest mb-1 text-white">Avg Entry</p>
            <p className="text-xl font-black truncate text-white">
              {symbol}{expenses.length ? (stats.total / expenses.length).toFixed(0) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-[32px] border transition-all ${cardBg} ${glassClass} shadow-sm`}>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Velocity Scan</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: settings.theme === 'dark' ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'var(--m3-primary)', opacity: 0.1, radius: 8}} 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    backgroundColor: settings.theme === 'dark' ? (settings.darkThemeType === 'true' ? '#0a0a0a' : '#0f172a') : '#ffffff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
                    fontWeight: '900',
                    fontSize: '12px',
                    color: settings.theme === 'dark' ? '#fff' : '#000'
                  }} 
                  formatter={(value: number) => [`${symbol}${value.toLocaleString()}`, 'Spent']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="var(--m3-primary)" 
                  radius={[8, 8, 8, 8]} 
                  barSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-[32px] border transition-all ${cardBg} ${glassClass} shadow-sm`}>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Allocation Matrix</h3>
          <div className="space-y-4">
            {stats.pieData.sort((a,b) => b.value - a.value).slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-4 group cursor-default">
                <div className="w-2.5 h-12 rounded-full transition-all group-hover:scale-y-110 bg-slate-200 dark:bg-white/10" />
                <div className="flex-1">
                  <p className="text-sm font-black opacity-90">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(item.value / (stats.total || 1)) * 100}%`, backgroundColor: 'var(--m3-primary)' }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black">{Math.round((item.value / (stats.total || 1)) * 100)}%</p>
                  </div>
                </div>
                <p className="font-black text-sm">{symbol}{item.value.toLocaleString()}</p>
              </div>
            ))}
            {stats.pieData.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-sm italic">Add data to visualize</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
