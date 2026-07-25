import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingDown, IndianRupee, RotateCw, Activity, CalendarDays, Wallet } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import CashflowRadar from './CashflowRadar';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Dashboard({ analysisResult, onUpdateSubscription, onUpdateData, onReset }) {
  const { subscriptions, stats } = analysisResult;

  const categoryData = useMemo(() => {
    const totals = {};
    subscriptions.forEach(sub => {
      if (sub.is_recurring && !sub.is_inactive) {
        totals[sub.category] = (totals[sub.category] || 0) + (sub.monthly_equivalent_amount || 0);
      }
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Complete</h2>
          <p className="text-muted-foreground mt-1">
            We found {subscriptions.length} transactions, tracking {stats.recurring_count} active subscriptions.
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border"
        >
          Analyze Another File
        </button>
      </div>

      {/* Top Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* HUGE Leak Score Card */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent border border-rose-500/30 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-rose-500/80 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Overall Leak Score
          </h3>
          <div className="text-6xl font-extrabold text-rose-500 tracking-tighter">
            {stats.overall_leak_score || 0}<span className="text-2xl text-rose-500/50">/100</span>
          </div>
          <p className="text-sm text-rose-500/80 mt-2 font-medium">Higher score = more money being wasted.</p>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col justify-center">
          <h3 className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">
            Total Monthly Spend
          </h3>
          <div className="text-3xl font-extrabold text-primary flex items-baseline gap-1">
            ₹{stats.total_monthly_spend?.toLocaleString('en-IN')} <span className="text-xs font-medium opacity-70">/mo</span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-center">
          <h3 className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Potential Savings
          </h3>
          <div className="text-3xl font-extrabold text-emerald-500">
            ₹{stats.potential_savings?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-card border border-border p-5 rounded-2xl flex flex-col justify-center">
           <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Realized Savings
          </h3>
          <div className="text-3xl font-bold text-white">
            ₹{stats.realized_savings?.toLocaleString('en-IN') || 0}
          </div>
        </div>

      </div>

      {/* Cashflow Radar (AI Timeline) */}
      <CashflowRadar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Category Chart */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Spend by Category (Monthly)
            </h3>
            <div className="h-[250px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No active spend to display.
                </div>
              )}
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-card border border-border p-4 rounded-xl">
               <RotateCw className="w-5 h-5 text-muted-foreground mb-2" />
               <p className="text-xs text-muted-foreground font-semibold uppercase">Recurring</p>
               <p className="text-xl font-bold text-white">{stats.recurring_count}</p>
             </div>
             <div className="bg-card border border-border p-4 rounded-xl">
               <CalendarDays className="w-5 h-5 text-muted-foreground mb-2" />
               <p className="text-xs text-muted-foreground font-semibold uppercase">Annual Plans</p>
               <p className="text-xl font-bold text-white">{stats.annual_count}</p>
             </div>
             <div className="bg-card border border-border p-4 rounded-xl">
               <Wallet className="w-5 h-5 text-rose-500 mb-2" />
               <p className="text-xs text-muted-foreground font-semibold uppercase">Highest Exp</p>
               <p className="text-lg font-bold text-white">₹{stats.highest_monthly_expense}</p>
             </div>
             <div className="bg-card border border-border p-4 rounded-xl">
               <Activity className="w-5 h-5 text-amber-500 mb-2" />
               <p className="text-xs text-muted-foreground font-semibold uppercase">Max Leak</p>
               <p className="text-lg font-bold text-white">{stats.highest_leak_score}</p>
             </div>
          </div>

        </div>

        {/* Subscriptions Grid */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-white">All Detected Subscriptions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={`${sub.merchant}-${index}`}
                subscription={sub}
                onUpdateSubscription={onUpdateSubscription}
                onUpdateData={onUpdateData}
              />
            ))}
            {subscriptions.length === 0 && (
              <div className="col-span-2 bg-card border border-border rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No subscriptions detected in the provided data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
