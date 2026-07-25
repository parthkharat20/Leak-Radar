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
  const borderAccent = getRecommendationBorderClass(recommendation);

  const getActionColor = (action) => {
    switch (action) {
      case 'Cancel':
      case 'Cancel Immediately':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Review Plan':
      case 'Review':
      case 'Needs Manual Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Downgrade':
      case 'Downgrade / Consolidate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Switch to Annual':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Consolidate Streaming Services':
      case 'Keep only one storage provider':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Keep':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Cancel':
      case 'Cancel Immediately':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Review Plan':
      case 'Review':
      case 'Needs Manual Review':
        return <Info className="w-3.5 h-3.5" />;
      case 'Downgrade':
      case 'Downgrade / Consolidate':
        return <Tag className="w-3.5 h-3.5" />;
      case 'Switch to Annual':
        return <RefreshCcw className="w-3.5 h-3.5" />;
      case 'Consolidate Streaming Services':
      case 'Keep only one storage provider':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Keep':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getLeakScoreColor = (score) => {
    if (score > 60) return 'text-rose-400 stroke-rose-400';
    if (score > 20) return 'text-amber-400 stroke-amber-400';
    return 'text-emerald-400 stroke-emerald-400';
  };

  const primaryButtonClass = {
    cancel: 'bg-rose-500/90 text-white hover:bg-rose-500',
    downgrade: 'bg-amber-500/90 text-white hover:bg-amber-500',
    negotiate: 'bg-indigo-500/90 text-white hover:bg-indigo-500',
  };

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
      "bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 border-l-[3px] transition-colors duration-150 p-5 rounded-lg relative overflow-hidden flex flex-col justify-between",
      borderAccent,
      is_inactive && "opacity-75 grayscale-[0.5]"
    )}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center shrink-0">
            {BrandIcon ? (
              <BrandIcon className="w-4 h-4" style={{ color: brand.color }} />
            ) : (
              <span className="text-xs font-semibold font-mono text-zinc-400">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-medium text-zinc-100 mb-1 flex flex-wrap items-center gap-2">
              <span className="truncate">{merchant}</span>
              <span className="text-[10px] uppercase tracking-wide bg-zinc-900/60 text-zinc-400 border border-zinc-800/70 px-2 py-0.5 rounded-full font-medium shrink-0">
                {billing_frequency}
              </span>
              {subscription.appears_unused && (
                <span className="text-[10px] uppercase tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  Appears Unused
                </span>
              )}
            </h3>
            <span className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
              {category}
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle className="text-zinc-800 stroke-current" strokeWidth="4" fill="transparent" r={radius} cx="30" cy="30" />
            <circle
              className={cn(getLeakScoreColor(leak_score))}
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

      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Latest Amount</p>
            <p className="text-2xl font-semibold text-zinc-100 font-mono tabular-nums">
              ₹{latest_amount?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            {renewal_date && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 justify-end mb-1 font-mono tabular-nums">
                <Calendar className="w-3.5 h-3.5" />
                Renews {renewal_date}
              </div>
            )}
            {price_hike_pct > 0 && (
              <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2 py-1 rounded-md text-[11px] font-medium border border-rose-500/20">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                <span className="font-mono tabular-nums">
                  {merchant}: ₹{(latest_amount - subscription.price_hike_amount).toLocaleString('en-IN')} → ₹{latest_amount?.toLocaleString('en-IN')} (+{price_hike_pct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg p-3 border border-zinc-800/70 bg-[#09090b]/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0",
              getActionColor(recommendation)
            )}>
              {getActionIcon(recommendation)}
              {recommendation}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {confidence_score < 60 && <ShieldAlert className="w-3 h-3 text-amber-400" />}
              <ConfidenceMeter score={confidence_score} />
            </div>
          </div>

          {recommendation_reason && (
            <details className="group text-xs text-zinc-400">
              <summary className="cursor-pointer list-none leading-relaxed [&::-webkit-details-marker]:hidden">
                <span className="text-zinc-500">{truncateWords(recommendation_reason)}</span>{' '}
                <span className="text-sky-400 group-open:hidden">Why?</span>
              </summary>
              <p className="mt-2 leading-relaxed text-zinc-400">{recommendation_reason}</p>
            </details>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800/70 flex flex-wrap items-center gap-x-4 gap-y-2">
          {primary && (
            <button
              onClick={() => handleAction(primary.open)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                primaryButtonClass[primary.key],
                is_inactive && "opacity-50 cursor-not-allowed"
              )}
            >
              {primary.label}
            </button>
          )}

          <div className="flex items-center gap-3">
            {secondaries.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.open)}
                className={cn(
                  "text-zinc-500 hover:text-zinc-300 text-xs underline-offset-2 hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded",
                  is_inactive && "opacity-50 cursor-not-allowed"
                )}
              >
                {action.label}
              </button>
            ))}
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
