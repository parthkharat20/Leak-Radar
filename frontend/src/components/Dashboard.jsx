import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, TrendingDown, RotateCw, Activity, CalendarDays, Wallet, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import SubscriptionCard from './SubscriptionCard';
import CashflowRadar from './CashflowRadar';

const COLORS = ['#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#818cf8', '#a78bfa', '#71717a'];

function MetricCard({ label, value, suffix, detail, icon: Icon, tone = 'text-zinc-100' }) {
  return (
    <div className="group relative min-h-[168px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/80">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-400/[0.035] blur-3xl transition-opacity group-hover:bg-cyan-400/[0.08]" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">{label}</p>
          <Icon className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-cyan-300" />
        </div>
        <div>
          <p className={cn('text-3xl font-semibold tracking-tight', tone)}>
            {value}<span className="ml-1.5 text-sm font-medium text-zinc-500">{suffix}</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />{detail}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ analysisResult, onUpdateSubscription, onUpdateData, onReset }) {
  const { subscriptions, stats, items_redacted } = analysisResult;

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
  const leakTone = leakScore > 60 ? 'text-rose-300' : leakScore > 20 ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="relative isolate mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-20 left-1/4 -z-10 h-[350px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-72 -z-10 h-72 w-72 rounded-full bg-indigo-500/[0.035] blur-[110px]" />

      <header className="flex flex-col justify-between gap-5 border-b border-zinc-800/70 pb-7 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Analysis complete
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-zinc-50 sm:text-4xl">Financial Command Center</h2>
          <p className="mt-2 text-sm text-zinc-400">{subscriptions.length} transactions analyzed · {stats.recurring_count} active subscriptions monitored.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {items_redacted > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-2 backdrop-blur-md flex items-center gap-2 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span>🔒</span>
              Privacy Shield Active: {items_redacted} Sensitive PII Points Redacted Locally
            </div>
          )}
          <button onClick={onReset} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Back to overview</button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative min-h-[168px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/80">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Overall leak score</p><Activity className="h-4 w-4 text-zinc-500" /></div>
            <div className="flex items-end justify-between gap-4">
              <div><p className={cn('text-3xl font-semibold tracking-tight', leakTone)}>{leakScore}<span className="ml-1.5 text-sm font-medium text-zinc-500">/100</span></p><p className="mt-2 text-xs text-zinc-500">Risk across active spend</p></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-950/70"><div className={cn('absolute inset-1 rounded-full border-2 border-t-transparent', leakScore > 60 ? 'border-rose-400' : leakScore > 20 ? 'border-amber-400' : 'border-emerald-400')} /><ShieldCheck className={cn('h-4 w-4', leakTone)} /></div>
            </div>
          </div>
        </div>
        <MetricCard label="Total monthly spend" value={`₹${stats.total_monthly_spend?.toLocaleString('en-IN')}`} suffix="/mo" detail="Across active renewals" icon={Wallet} tone="bg-gradient-to-r from-cyan-200 to-sky-400 bg-clip-text text-transparent" />
        <MetricCard label="Potential savings" value={`₹${stats.potential_savings?.toLocaleString('en-IN')}`} detail="Available to recover" icon={TrendingDown} tone="bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent" />
        <MetricCard label="Realized savings" value={`₹${stats.realized_savings?.toLocaleString('en-IN') || 0}`} detail="Actions completed" icon={ArrowUpRight} />
      </section>

      <CashflowRadar trigger={stats.total_monthly_spend} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />
          <div className="relative flex items-start justify-between"><div><p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Allocation</p><h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">Category spending</h3></div><span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-xs font-mono text-zinc-400">₹{stats.total_monthly_spend?.toLocaleString('en-IN')}</span></div>
          <div className="relative mt-4 h-[220px]">
            {categoryData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} cx="50%" cy="46%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">{categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} contentStyle={{ backgroundColor: 'rgba(9,9,11,0.96)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: '10px', fontSize: '12px' }} itemStyle={{ color: '#f4f4f5' }} /><Legend verticalAlign="bottom" height={34} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-zinc-500">No active spend to display.</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-xl h-full flex flex-col justify-center">
          <div className="grid h-full w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
            {[
              { label: 'Recurring plans', value: stats.recurring_count, icon: RotateCw, color: 'text-cyan-300' },
              { label: 'Annual plans', value: stats.annual_count, icon: CalendarDays, color: 'text-violet-300' },
              { label: 'Highest expense', value: `₹${stats.highest_monthly_expense}`, icon: Wallet, color: 'text-rose-300' },
              { label: 'Max leak score', value: stats.highest_leak_score, icon: Activity, color: 'text-amber-300' },
            ].map(({ label, value, icon: Icon, color }) => <div key={label} className="bg-zinc-950/80 p-4 sm:p-5"><Icon className={cn('h-4 w-4', color)} /><p className="mt-3 text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">{value}</p></div>)}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">Portfolio</p><h3 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">Active Subscriptions & Leaks</h3></div><span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400">{subscriptions.length} detected</span></div>
        <div className="flex flex-col gap-5">
          {subscriptions.map((sub, index) => <SubscriptionCard key={`${sub.merchant}-${index}`} subscription={sub} onUpdateSubscription={onUpdateSubscription} onUpdateData={onUpdateData} />)}
          {subscriptions.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center text-sm text-zinc-500">No subscriptions detected in the provided data.</div>}
        </div>
      </section>
    </div>
  );
}
