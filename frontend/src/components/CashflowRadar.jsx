import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { getCashflowForecast } from '../api';
import { cn } from '../lib/utils';

export default function CashflowRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const result = await getCashflowForecast();
        
        // Format dates for the X axis
        if (result && result.timeline) {
          result.timeline = result.timeline.map(item => ({
            ...item,
            displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));
        }
        
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load cashflow forecast.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Cashflow Radar...</p>
      </div>
    );
  }

  if (error || !data || !data.timeline) {
    return null;
  }

  const { timeline, shock_alert } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-lg font-black text-white mb-2">₹{data.amount.toLocaleString('en-IN')}</p>
          {data.services && data.services.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Renewals:</p>
              <ul className="text-sm text-primary font-medium">
                {data.services.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm relative mb-6">
      
      {/* AI Alert Banner */}
      {shock_alert && shock_alert.has_risk && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-3">
          <div className="bg-rose-500/20 p-1.5 rounded-full relative">
            <Zap className="w-4 h-4 text-rose-500 relative z-10" />
            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-500">Cashflow Shock Detected</h4>
            <p className="text-xs text-rose-500/80 font-medium">{shock_alert.message}</p>
          </div>
        </div>
      )}
      
      {!shock_alert?.has_risk && (
         <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-6 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs font-medium text-emerald-500/90">Your 30-day cashflow looks healthy. No shock clusters detected.</p>
         </div>
      )}

      <div className="p-6 pb-2">
        <h3 className="text-lg font-bold text-white mb-1">30-Day Cashflow Radar</h3>
        <p className="text-xs text-muted-foreground mb-6">AI-predicted subscription renewals over the next month.</p>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  {/* Using standard Tailwind Cyan/Blue hex codes for dark mode */}
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
