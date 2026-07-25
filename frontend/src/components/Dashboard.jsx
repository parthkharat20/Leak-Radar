import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Dashboard({ analysisResult, inactiveMerchants, onToggleInactive, onReset }) {
  const { subscriptions, total_monthly_leak } = analysisResult;

  const categoryData = useMemo(() => {
    const totals = {};
    subscriptions.forEach(sub => {
      // only count active subs for the chart if we want to reflect current spend, 
      // but let's just show everything or filter based on inactiveMerchants
      if (!inactiveMerchants.includes(sub.merchant)) {
        totals[sub.category] = (totals[sub.category] || 0) + sub.latest_amount;
      }
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, inactiveMerchants]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Complete</h2>
          <p className="text-muted-foreground mt-1">
            We found {subscriptions.length} subscriptions in your data.
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border"
        >
          Analyze Another File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Level Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-24 h-24 text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Total Monthly Leak
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white">
                ₹{total_monthly_leak.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-rose-400 mt-4 font-medium flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              Potential savings if action taken
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Active Spend by Category
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
        </div>

        {/* Subscriptions Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map(sub => (
              <SubscriptionCard
                key={sub.merchant}
                subscription={{
                  ...sub,
                  is_inactive: inactiveMerchants.includes(sub.merchant)
                }}
                onToggleInactive={onToggleInactive}
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
