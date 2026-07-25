import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { getCashflowForecast } from '../api';

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
      <div className="w-full bg-zinc-900/40 border border-zinc-800/70 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
        <p className="text-zinc-500 text-sm font-medium">Initializing Cashflow Radar...</p>
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
        <div className="bg-zinc-900/95 border border-zinc-800/70 p-3 rounded-lg">
          <p className="text-[10px] uppercase tracking-wide font-medium text-zinc-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-zinc-100 font-mono tabular-nums mb-2">₹{data.amount.toLocaleString('en-IN')}</p>
          {data.services && data.services.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide font-medium text-zinc-500">Renewals:</p>
              <ul className="text-sm text-sky-400 font-medium">
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
    <div className="w-full bg-zinc-900/40 border border-zinc-800/70 rounded-lg overflow-hidden relative">
      
      {/* AI Alert Banner */}
      {shock_alert && shock_alert.has_risk && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-3">
          <div className="bg-rose-500/20 p-1.5 rounded-full">
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-rose-400">Cashflow Shock Detected</h4>
            <p className="text-xs text-rose-400/80">{shock_alert.message}</p>
          </div>
        </div>
      )}
      
      {!shock_alert?.has_risk && (
         <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-6 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-medium text-emerald-400/90">Your 30-day cashflow looks healthy. No shock clusters detected.</p>
         </div>
      )}

      <div className="p-6 pb-2">
        <h3 className="text-base font-medium text-zinc-100 mb-1">30-Day Cashflow Radar</h3>
        <p className="text-xs text-zinc-500 mb-6">AI-predicted subscription renewals over the next month.</p>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a' }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'Geist Mono, monospace' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#38bdf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                activeDot={{ r: 5, fill: '#38bdf8', stroke: '#09090b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
