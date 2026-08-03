import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, TrendingDown, RotateCw, Activity, CalendarDays, Wallet, ShieldCheck, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import SubscriptionCard from './SubscriptionCard';
import CashflowRadar from './CashflowRadar';

const COLORS = ['#024ad8', '#296ef9', '#356373', '#ff5050', '#1a1a1a', '#8ebdce', '#636363'];

function MetricCard({ label, value, suffix, detail, icon: Icon, tone = 'text-[#1a1a1a]' }) {
  return (
    <div className="hp-card hp-card-hover p-6 flex flex-col justify-between min-h-[150px] relative overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#636363]">{label}</p>
        <Icon className="h-4 w-4 text-[#024ad8]" />
      </div>
      <div className="mt-4">
        <p className={cn('text-3xl font-bold tracking-tight font-mono', tone)}>
          {value}<span className="ml-1 text-sm font-normal text-[#636363]">{suffix}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#636363] font-medium">
          <ArrowUpRight className="h-3.5 w-3.5 text-[#024ad8]" />
          {detail}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard({ analysisResult, onUpdateSubscription, onUpdateData, onReset }) {
  const { subscriptions = [], stats = {}, items_redacted = 0 } = analysisResult || {};
  const [filter, setFilter] = useState('all'); // all, recurring, high_risk, resolved

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'recurring') {
      return subscriptions.filter(s => s.is_recurring && !s.is_inactive);
    }
    if (filter === 'high_risk') {
      return subscriptions.filter(s => (s.leak_score || 0) > 30 && !s.is_inactive);
    }
    if (filter === 'resolved') {
      return subscriptions.filter(s => s.is_inactive);
    }
    return subscriptions;
  }, [subscriptions, filter]);

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
  const leakTone = leakScore > 60 ? 'text-[#ff5050]' : leakScore > 20 ? 'text-[#024ad8]' : 'text-[#1a1a1a]';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-rise">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e8e8e8]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.7px] text-[#024ad8]">
            <span className="h-2 w-2 rounded-full bg-[#024ad8]" />
            HP LeakRadar Executive Summary
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#1a1a1a]">
            Subscription Audit Dashboard
          </h2>
          <p className="mt-1 text-sm text-[#636363]">
            {subscriptions.length} transactions scored · {stats.recurring_count || 0} active recurring plans monitored.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {items_redacted > 0 && (
            <div className="bg-[#f7f7f7] border border-[#e8e8e8] text-[#1a1a1a] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
              <span>🔒</span>
              <span>{items_redacted} PII Items Scrubbed</span>
            </div>
          )}
          <button onClick={onReset} className="hp-btn-outline hp-btn-sm text-xs">
            Reset Overview
          </button>
        </div>
      </header>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="hp-card hp-card-hover p-6 flex flex-col justify-between min-h-[150px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#636363]">Overall Leak Score</p>
            <Activity className="h-4 w-4 text-[#024ad8]" />
          </div>
          <div className="flex items-end justify-between gap-4 mt-4">
            <div>
              <p className={cn('text-3xl font-bold tracking-tight font-mono', leakTone)}>
                {leakScore}<span className="ml-1 text-sm font-normal text-[#636363]">/100</span>
              </p>
              <p className="mt-1 text-xs text-[#636363] font-medium">Weighted portfolio risk</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e8e8] bg-[#f7f7f7]">
              <ShieldCheck className={cn('h-5 w-5', leakTone)} />
            </div>
          </div>
        </div>

        <MetricCard
          label="Total Monthly Spend"
          value={`₹${stats.total_monthly_spend?.toLocaleString('en-IN') || 0}`}
          suffix="/mo"
          detail="Across active subscriptions"
          icon={Wallet}
          tone="text-[#1a1a1a]"
        />
        <MetricCard
          label="Potential Savings"
          value={`₹${stats.potential_savings?.toLocaleString('en-IN') || 0}`}
          detail="Recoverable recurring leaks"
          icon={TrendingDown}
          tone="text-[#024ad8]"
        />
        <MetricCard
          label="Realized Savings"
          value={`₹${stats.realized_savings?.toLocaleString('en-IN') || 0}`}
          detail="Actions completed"
          icon={ArrowUpRight}
          tone="text-[#1a1a1a]"
        />
      </section>

      {/* Cashflow Radar Visualizer */}
      <CashflowRadar trigger={stats.total_monthly_spend} />

      {/* Category Breakdown & Key Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div className="hp-card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#636363]">Allocation</p>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Category Spending</h3>
            </div>
            <span className="bg-[#f7f7f7] border border-[#e8e8e8] text-[#1a1a1a] px-2.5 py-1 rounded-full text-xs font-mono font-semibold">
              ₹{stats.total_monthly_spend?.toLocaleString('en-IN') || 0}
            </span>
          </div>
          <div className="relative mt-4 h-[220px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="46%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '12px', color: '#1a1a1a' }}
                    itemStyle={{ color: '#1a1a1a' }}
                  />
                  <Legend verticalAlign="bottom" height={34} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#636363' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#636363]">
                No active recurring spend detected.
              </div>
            )}
          </div>
        </div>

        {/* 2x2 Summary Stat Grid */}
        <div className="hp-card p-6 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Recurring Plans', value: stats.recurring_count || 0, icon: RotateCw, color: 'text-[#024ad8]' },
              { label: 'Annual Subscriptions', value: stats.annual_count || 0, icon: CalendarDays, color: 'text-[#356373]' },
              { label: 'Highest Monthly Expense', value: `₹${stats.highest_monthly_expense || 0}`, icon: Wallet, color: 'text-[#ff5050]' },
              { label: 'Highest Leak Score', value: stats.highest_leak_score || 0, icon: Activity, color: 'text-[#024ad8]' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#f7f7f7] border border-[#e8e8e8] p-5 rounded-[12px]">
                <Icon className={cn('h-5 w-5', color)} />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.7px] text-[#636363]">{label}</p>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1a1a1a]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Portfolio & Filter Pills */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e8e8]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#024ad8]">Portfolio Breakdown</p>
            <h3 className="text-2xl font-medium text-[#1a1a1a]">Scored Subscriptions</h3>
          </div>

          {/* HP Category Tab Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn('hp-tab', filter === 'all' && 'hp-tab-active')}
            >
              All ({subscriptions.length})
            </button>
            <button
              onClick={() => setFilter('recurring')}
              className={cn('hp-tab', filter === 'recurring' && 'hp-tab-active')}
            >
              Recurring ({subscriptions.filter(s => s.is_recurring && !s.is_inactive).length})
            </button>
            <button
              onClick={() => setFilter('high_risk')}
              className={cn('hp-tab', filter === 'high_risk' && 'hp-tab-active')}
            >
              High Risk ({subscriptions.filter(s => (s.leak_score || 0) > 30 && !s.is_inactive).length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={cn('hp-tab', filter === 'resolved' && 'hp-tab-active')}
            >
              Resolved ({subscriptions.filter(s => s.is_inactive).length})
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {filteredSubscriptions.map((sub, index) => (
            <SubscriptionCard
              key={`${sub.merchant}-${index}`}
              subscription={sub}
              onUpdateSubscription={onUpdateSubscription}
              onUpdateData={onUpdateData}
            />
          ))}

          {filteredSubscriptions.length === 0 && (
            <div className="hp-card p-12 text-center text-sm text-[#636363] border-dashed">
              No subscriptions match the selected filter.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

