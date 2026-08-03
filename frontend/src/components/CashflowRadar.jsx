import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, CheckCircle2, Radar } from 'lucide-react';
import { getCashflowForecast } from '../api';
import { Skeleton } from './magicui/Skeleton';

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

  if (loading) return (
    <div className="hp-card p-8 flex flex-col justify-between min-h-[280px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-56" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-[8px]" />
      <Skeleton className="h-[180px] w-full rounded-[8px]" />
    </div>
  );

  if (error || !data || !data.timeline) return null;

  const { timeline, shock_alert } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="hp-card p-3.5 shadow-md border-[#e8e8e8] bg-white min-w-[160px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#636363]">{label}</p>
        <p className="mt-1 text-lg font-bold text-[#1a1a1a] font-mono">₹{point.amount.toLocaleString('en-IN')}</p>
        {point.services?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#e8e8e8]">
            <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#024ad8]">Renewing Services</p>
            <ul className="mt-1 space-y-0.5 text-xs text-[#1a1a1a] font-medium">
              {point.services.map((service, index) => (
                <li key={index}>• {service}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="hp-card p-6 md:p-7 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.7px] text-[#024ad8]">
            <Radar className="h-4 w-4 text-[#024ad8]" />
            <span>Forecast Intelligence</span>
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a]">30-Day Cashflow Projection</h3>
          <p className="mt-0.5 text-xs text-[#636363]">
            Predicted subscription renewal load over the next month.
          </p>
        </div>
        <span className="bg-[#f7f7f7] border border-[#e8e8e8] text-[#1a1a1a] text-xs font-medium px-3 py-1 rounded-full">
          Next 30 Days
        </span>
      </div>

      <div className="mt-5">
        {shock_alert?.has_risk ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-start gap-3 rounded-[8px] border border-[#b3262b]/20 bg-[#f9d4d2] p-3.5 text-[#b3262b]"
          >
            <Zap className="h-4 w-4 shrink-0 mt-0.5 text-[#b3262b] animate-bounce" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Cashflow Cluster Alert</h4>
              <p className="mt-0.5 text-xs leading-relaxed">{shock_alert.message}</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-[8px] border border-[#e8e8e8] bg-[#f7f7f7] p-3 text-[#1a1a1a]">
            <CheckCircle2 className="h-4 w-4 text-[#024ad8]" />
            <p className="text-xs font-medium">30-day cashflow forecast is healthy. No overdraft clusters detected.</p>
          </div>
        )}
      </div>

      <div className="mt-6 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="hpCashflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#024ad8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#024ad8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e8" />
            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636363' }} dy={8} minTickGap={30} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636363' }} tickFormatter={(val) => `₹${val}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#024ad8', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area type="monotone" dataKey="amount" stroke="#024ad8" strokeWidth={2.5} fillOpacity={1} fill="url(#hpCashflowGradient)" activeDot={{ r: 5, fill: '#024ad8', stroke: '#ffffff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}


