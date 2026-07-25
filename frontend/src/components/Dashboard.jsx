import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDown, RotateCw, Activity, CalendarDays, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import SubscriptionCard from './SubscriptionCard';
import CashflowRadar from './CashflowRadar';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#818cf8', '#a78bfa', '#71717a'];

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

  const leakScore = stats.overall_leak_score || 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">Analysis Complete</h2>
          <p className="text-zinc-400 text-sm mt-1">
            We found {subscriptions.length} transactions, tracking {stats.recurring_count} active subscriptions.
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900/40 hover:text-zinc-100 hover:border-zinc-700/80 rounded-full transition-colors duration-150 border border-zinc-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Back to Overview
        </button>
      </div>

      {/* Top Level Stats — Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">

        {/* Hero Leak Score Card with Radar Sweep */}
        <div className="bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors duration-150 p-6 rounded-lg relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-4">
            Overall Leak Score
          </p>

          <div className="relative flex items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full animate-radar-sweep"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(56, 189, 248, 0.45) 320deg, transparent 360deg)',
                }}
              />
              <div className="absolute inset-1.5 rounded-full bg-[#09090b]" />
              <span className={cn(
                "relative z-10 text-4xl font-semibold font-mono tabular-nums inline-block",
                leakScore > 60
                  ? "text-rose-400 shadow-[0_0_24px_-8px_theme(colors.rose.500)]"
                  : "bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent"
              )}>
                {leakScore}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-3 text-center font-mono tabular-nums">
            /100 · higher = more waste
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors duration-150 p-6 rounded-lg flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-2">
            Total Monthly Spend
          </p>
          <div className="text-2xl font-semibold text-zinc-100 font-mono tabular-nums flex items-baseline gap-1">
            ₹{stats.total_monthly_spend?.toLocaleString('en-IN')}<span className="text-xs font-normal text-zinc-500">/mo</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors duration-150 p-6 rounded-lg flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-2 flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3" /> Potential Savings
          </p>
          <div className="text-2xl font-semibold text-emerald-400 font-mono tabular-nums">
            ₹{stats.potential_savings?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors duration-150 p-6 rounded-lg flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-2">
            Realized Savings
          </p>
          <div className="text-2xl font-semibold text-zinc-100 font-mono tabular-nums">
            ₹{stats.realized_savings?.toLocaleString('en-IN') || 0}
          </div>
        </div>

      </div>

      {/* Cashflow Radar (AI Timeline) */}
      <CashflowRadar />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        {/* Left Column — unified sidebar panel */}
        <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-6">
              Spend by Category (Monthly)
            </p>
            <div className="h-[220px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        border: '1px solid rgba(63, 63, 70, 0.7)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#f4f4f5', fontFamily: 'Geist Mono, monospace' }}
                      labelStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  No active spend to display.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800/70 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <RotateCw className="w-4 h-4 text-zinc-500" />
                <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium pt-1">Recurring</p>
                <p className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">{stats.recurring_count}</p>
              </div>
              <div className="space-y-1">
                <CalendarDays className="w-4 h-4 text-zinc-500" />
                <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium pt-1">Annual Plans</p>
                <p className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">{stats.annual_count}</p>
              </div>
              <div className="space-y-1">
                <Wallet className="w-4 h-4 text-rose-400" />
                <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium pt-1">Highest Exp</p>
                <p className="text-lg font-semibold text-zinc-100 font-mono tabular-nums">₹{stats.highest_monthly_expense}</p>
              </div>
              <div className="space-y-1">
                <Activity className="w-4 h-4 text-amber-400" />
                <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium pt-1">Max Leak</p>
                <p className="text-lg font-semibold text-zinc-100 font-mono tabular-nums">{stats.highest_leak_score}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-base font-medium text-zinc-100">All Detected Subscriptions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={`${sub.merchant}-${index}`}
                subscription={sub}
                onUpdateSubscription={onUpdateSubscription}
                onUpdateData={onUpdateData}
              />
            ))}
            {subscriptions.length === 0 && (
              <div className="col-span-2 bg-zinc-900/40 border border-zinc-800/70 rounded-lg p-12 text-center">
                <p className="text-zinc-500 text-sm">No subscriptions detected in the provided data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
