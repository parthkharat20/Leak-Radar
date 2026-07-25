import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Zap, CheckCircle2, Radar } from 'lucide-react';
import { getCashflowForecast } from '../api';

export default function CashflowRadar({ trigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const result = await getCashflowForecast();
        if (result && result.timeline) {
          result.timeline = result.timeline.map(item => ({ ...item, displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
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
  }, [trigger]);

  if (loading) return <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8"><Loader2 className="mb-4 h-7 w-7 animate-spin text-cyan-300" /><p className="text-sm font-medium text-zinc-500">Calibrating cashflow radar...</p></div>;
  if (error || !data || !data.timeline) return null;

  const { timeline, shock_alert } = data;
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return <div className="min-w-[150px] rounded-xl border border-zinc-700/80 bg-[#09090b]/95 p-3.5 shadow-2xl shadow-black/50"><p className="text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">{label}</p><p className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">₹{point.amount.toLocaleString('en-IN')}</p>{point.services?.length > 0 && <div className="mt-3 border-t border-zinc-800 pt-2"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Renewals</p><ul className="mt-1 space-y-0.5 text-xs text-cyan-300">{point.services.map((service, index) => <li key={index}>{service}</li>)}</ul></div>}</div>;
  };

  return <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-[0_24px_70px_-45px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-7">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
    <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-400/[0.045] blur-[90px]" />
    <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-cyan-300"><Radar className="h-3.5 w-3.5" />Forecast intelligence</div><h3 className="text-xl font-semibold tracking-tight text-zinc-100">30-Day Cashflow Projection</h3><p className="mt-1 text-sm text-zinc-400">AI-predicted subscription renewals over the next month.</p></div><span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-400">Next 30 days</span></div>
    <div className="relative mt-6">{shock_alert?.has_risk ? <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)] backdrop-blur-md"><div className="mt-0.5 rounded-lg bg-rose-500/15 p-1.5"><Zap className="h-4 w-4" /></div><div><h4 className="text-sm font-semibold">Cashflow shock detected</h4><p className="mt-0.5 text-xs leading-relaxed text-rose-300/80">{shock_alert.message}</p></div></div> : <div className="flex items-center gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-3 text-emerald-300"><CheckCircle2 className="h-4 w-4" /><p className="text-xs font-medium">Your 30-day cashflow looks healthy. No shock clusters detected.</p></div>}</div>
    <div className="relative mt-6 h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} /><stop offset="75%" stopColor="#10b981" stopOpacity={0.06} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(63,63,70,0.7)" /><XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} minTickGap={30} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'Geist Mono, monospace' }} tickFormatter={(value) => `₹${value}`} /><Tooltip content={<CustomTooltip />} cursor={{ stroke: '#67e8f9', strokeWidth: 1, strokeDasharray: '3 5', opacity: 0.5 }} /><Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2.25} fillOpacity={1} fill="url(#cashflowGradient)" activeDot={{ r: 5, fill: '#67e8f9', stroke: '#09090b', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>
  </section>;
}
