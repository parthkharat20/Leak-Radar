import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  getBrandIcon,
  getServiceInitials,
  getPrimaryActionKey,
  getRecommendationBorderClass,
} from '../lib/brandIcon';
import { AlertCircle, ArrowUpRight, CheckCircle2, Info, Tag, Calendar, ShieldAlert, Sparkles, Layers, RefreshCcw, AlertTriangle } from 'lucide-react';
import CancellationModal from './CancellationModal';
import DowngradeModal from './DowngradeModal';
import NegotiateModal from './NegotiateModal';

function truncateWords(text, count = 8) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return text;
  return `${words.slice(0, count).join(' ')}…`;
}

function ConfidenceMeter({ score }) {
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="flex-1 h-px bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-px bg-sky-400 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-zinc-500 font-mono tabular-nums shrink-0">
        {score}%
      </span>
    </div>
  );
}

export default function SubscriptionCard({ subscription, onUpdateSubscription, onUpdateData }) {
  const {
    merchant,
    category,
    billing_frequency,
    latest_amount,
    price_hike_pct,
    leak_score,
    recommendation,
    recommendation_reason,
    confidence_score = 0,
    renewal_date,
    is_inactive = false,
  } = subscription;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);

  const brand = getBrandIcon(merchant);
  const BrandIcon = brand?.Icon;
  const initials = getServiceInitials(merchant);
  const primaryAction = getPrimaryActionKey(recommendation);

  const getTheme = (score) => {
    if (score > 60) return 'rose';
    if (score > 20) return 'amber';
    return 'emerald';
  };
  const theme = getTheme(leak_score || 0);

  const THEMES = {
    rose: {
      text: 'text-rose-400',
      stroke: 'stroke-rose-400',
      bgGlow: 'from-rose-500/40 via-rose-500/10',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      primaryBtn: 'bg-gradient-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 text-rose-400 hover:from-rose-500/30 hover:to-rose-500/10 hover:border-rose-400/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:-translate-y-0.5',
      secondaryBtn: 'hover:border-rose-700 hover:bg-rose-900/30 hover:text-rose-100 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] focus-visible:ring-rose-400',
      blur: 'bg-rose-500/[0.03] group-hover:bg-rose-500/[0.06]'
    },
    amber: {
      text: 'text-amber-400',
      stroke: 'stroke-amber-400',
      bgGlow: 'from-amber-500/40 via-amber-500/10',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      primaryBtn: 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 hover:from-amber-500/30 hover:to-amber-500/10 hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:-translate-y-0.5',
      secondaryBtn: 'hover:border-amber-700 hover:bg-amber-900/30 hover:text-amber-100 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] focus-visible:ring-amber-400',
      blur: 'bg-amber-500/[0.03] group-hover:bg-amber-500/[0.06]'
    },
    emerald: {
      text: 'text-emerald-400',
      stroke: 'stroke-emerald-400',
      bgGlow: 'from-emerald-500/40 via-emerald-500/10',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      primaryBtn: 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-emerald-500/10 hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5',
      secondaryBtn: 'hover:border-emerald-700 hover:bg-emerald-900/30 hover:text-emerald-100 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus-visible:ring-emerald-400',
      blur: 'bg-emerald-500/[0.03] group-hover:bg-emerald-500/[0.06]'
    }
  };

  const t = THEMES[theme];

  const actions = [
    { key: 'cancel', label: 'Cancel', open: () => setIsModalOpen(true) },
    { key: 'downgrade', label: 'Downgrade', open: () => setIsDowngradeModalOpen(true) },
    { key: 'negotiate', label: 'Negotiate', open: () => setIsNegotiateModalOpen(true) },
  ];

  const primary = actions.find((a) => a.key === primaryAction);
  const secondaries = actions.filter((a) => a.key !== primaryAction);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((leak_score || 0) / 100) * circumference;

  const handleAction = (open) => {
    if (!is_inactive) open();
  };

  return (
    <div className={cn(
      "group relative flex min-h-[360px] md:min-h-0 flex-col lg:flex-row gap-6 justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]",
      is_inactive && "opacity-75 grayscale-[0.4]"
    )}>
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent opacity-80 animate-pulse duration-[3000ms]", t.bgGlow)} />
      <div className={cn("hidden lg:block absolute inset-y-0 left-0 w-px bg-gradient-to-b to-transparent opacity-80", t.bgGlow)} />
      <div className={cn("pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-colors duration-500", t.blur)} />
      
      {/* Left Column (Brand & Score) */}
      <div className="relative z-10 flex items-start justify-between lg:flex-col lg:w-[260px] lg:shrink-0 lg:border-r lg:border-zinc-800/60 lg:pr-6 lg:mb-0 mb-5">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 shadow-inner shadow-black/40">
            {BrandIcon ? (
              <BrandIcon className="h-6 w-6" style={{ color: brand.color }} />
            ) : (
              <span className="text-sm font-bold font-mono text-zinc-300">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="mb-1.5 flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight text-zinc-50">
              <span className="truncate">{merchant}</span>
              <span className="shrink-0 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
                {billing_frequency}
              </span>
              {subscription.appears_unused && (
                <span className={cn("text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shrink-0 animate-pulse", t.badge)}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Appears Unused
                </span>
              )}
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {category}
            </span>
          </div>
        </div>

        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zinc-800/80 bg-zinc-950/60 p-0.5 lg:mt-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle className="text-zinc-800 stroke-current" strokeWidth="4" fill="transparent" r={radius} cx="30" cy="30" />
            <circle
              className={cn("transition-all duration-1000 ease-out", t.stroke)}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="30"
              cy="30"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold text-zinc-100 font-mono tabular-nums">{leak_score || 0}</span>
          </div>
        </div>
      </div>

      {/* Right Column (Details & Actions) */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5 lg:pl-2 lg:space-y-0">
        <div className="flex items-end justify-between gap-4 lg:mb-5">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Latest amount</p>
            <p className="text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
              ₹{latest_amount?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            {renewal_date && (
              <div className="mb-1.5 flex items-center justify-end gap-1.5 text-sm text-zinc-400 font-mono tabular-nums">
                <Calendar className="w-4 h-4" />
                Renews {renewal_date}
              </div>
            )}
            {price_hike_pct > 0 && (
              <div className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold", t.badge)}>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono tabular-nums">
                  {merchant}: ₹{(latest_amount - subscription.price_hike_amount).toLocaleString('en-IN')} → ₹{latest_amount?.toLocaleString('en-IN')} (+{price_hike_pct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-end">
          <div className="space-y-3 rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-4 shadow-inner shadow-black/50 transition-all duration-300 hover:border-zinc-600/80">
          <div className="flex items-center justify-between gap-2">
            <div className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold shadow-sm transition-transform hover:scale-105",
              t.badge
            )}>
              {recommendation}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {confidence_score < 60 && <ShieldAlert className={cn("w-4 h-4 animate-pulse", t.text)} />}
              <ConfidenceMeter score={confidence_score} />
            </div>
          </div>

          {recommendation_reason && (
          <details className="group text-sm text-zinc-400">
              <summary className="cursor-pointer list-none leading-relaxed [&::-webkit-details-marker]:hidden">
                <span className="text-zinc-400 font-medium">{truncateWords(recommendation_reason)}</span>{' '}
                <span className="text-cyan-400 font-semibold group-open:hidden hover:text-cyan-300">Why?</span>
              </summary>
              <p className="mt-2.5 leading-relaxed text-zinc-300">{recommendation_reason}</p>
            </details>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end border-t border-zinc-700/60 pt-5 lg:border-t-0 lg:pt-0">
          {primary && (
            <button
              onClick={() => handleAction(primary.open)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2",
                t.primaryBtn,
                is_inactive && "opacity-50 cursor-not-allowed"
              )}
            >
              {primary.label}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            {secondaries.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.open)}
                className={cn(
                  "rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 shadow-sm",
                  t.secondaryBtn,
                  is_inactive && "opacity-50 cursor-not-allowed"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>

      <CancellationModal
        subscription={subscription}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(updatedData) => {
          if (onUpdateData) {
            onUpdateData(updatedData);
          }
        }}
      />

      <DowngradeModal
        subscription={subscription}
        isOpen={isDowngradeModalOpen}
        onClose={() => setIsDowngradeModalOpen(false)}
        onSuccess={(updatedData) => {
          if (onUpdateData) {
            onUpdateData(updatedData);
          }
        }}
      />

      <NegotiateModal
        subscription={subscription}
        isOpen={isNegotiateModalOpen}
        onClose={() => setIsNegotiateModalOpen(false)}
      />
    </div>
  );
}
