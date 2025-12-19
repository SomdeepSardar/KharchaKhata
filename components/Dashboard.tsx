
import React, { useMemo } from 'react';
import { Expense } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';

interface DashboardProps {
  expenses: Expense[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#22d3ee', '#fb7185'];

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
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

  return (
    <div className="space-y-6">
      {/* Balance Card - Elevated for Mobile */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
        
        <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Current Spending</p>
        <h2 className="text-5xl font-black tracking-tight mb-8">
          ₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-2xl opacity-60 font-medium">.{stats.total.toFixed(2).split('.')[1]}</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
            <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-1">Items</p>
            <p className="text-xl font-bold">{expenses.length}</p>
          </div>
          <div className="bg-white/15 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
            <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-1">Avg</p>
            <p className="text-xl font-bold">
              ₹{expenses.length ? (stats.total / expenses.length).toFixed(0) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Spending Trend</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontWeight: 'bold' }} 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">By Category</h3>
          <div className="space-y-4">
            {stats.pieData.sort((a,b) => b.value - a.value).slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{Math.round((item.value / stats.total) * 100)}% of total</p>
                </div>
                <p className="font-bold text-slate-900">₹{item.value.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
