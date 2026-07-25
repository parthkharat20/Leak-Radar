import { cn } from '../lib/utils';
import { AlertCircle, ArrowUpRight, CheckCircle2, Info, Tag, Calendar, ShieldAlert, Sparkles, Layers, RefreshCcw } from 'lucide-react';

export default function SubscriptionCard({ subscription, onToggleInactive }) {
  const {
    merchant,
    category,
    is_recurring,
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

  const getActionColor = (action) => {
    switch (action) {
      case 'Cancel':
      case 'Cancel Immediately':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Review Plan':
      case 'Review':
      case 'Needs Manual Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Downgrade':
      case 'Downgrade / Consolidate':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Switch to Annual':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'Consolidate Streaming Services':
      case 'Keep only one storage provider':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Keep':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Cancel':
      case 'Cancel Immediately':
        return <AlertCircle className="w-4 h-4" />;
      case 'Review Plan':
      case 'Review':
      case 'Needs Manual Review':
        return <Info className="w-4 h-4" />;
      case 'Downgrade':
      case 'Downgrade / Consolidate':
        return <Tag className="w-4 h-4" />;
      case 'Switch to Annual':
        return <RefreshCcw className="w-4 h-4" />;
      case 'Consolidate Streaming Services':
      case 'Keep only one storage provider':
        return <Layers className="w-4 h-4" />;
      case 'Keep':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getLeakScoreColor = (score) => {
    if (score > 60) return 'text-rose-500 stroke-rose-500';
    if (score > 20) return 'text-amber-500 stroke-amber-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  // Simple SVG Gauge/Ring for the leak score
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((leak_score || 0) / 100) * circumference;

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 shadow-sm transition-all hover:shadow-lg relative overflow-hidden flex flex-col justify-between",
      is_inactive && "opacity-75 grayscale-[0.5]"
    )}>
      {/* Leak Score Ring Background */}
      <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <circle className={getLeakScoreColor(leak_score)} strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
        </svg>
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
            {merchant}
            <span className="text-[10px] uppercase tracking-wider bg-secondary text-foreground border border-border px-2 py-0.5 rounded-full font-semibold">
              {billing_frequency}
            </span>
            {subscription.appears_unused && (
              <span className="text-[10px] uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                ⚠️ Appears Unused
              </span>
            )}
          </h3>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            {category}
          </span>
        </div>
        
        {/* Leak Score Gauge */}
        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle className="text-muted stroke-current" strokeWidth="4" fill="transparent" r={radius} cx="30" cy="30" />
            <circle
              className={cn("transition-all duration-1000 ease-out", getLeakScoreColor(leak_score))}
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
            <span className="text-sm font-bold text-foreground">{leak_score || 0}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-end">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Latest Amount</p>
            <p className="text-2xl font-bold text-white">
              ₹{latest_amount?.toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="text-right">
            {renewal_date && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Renews {renewal_date}
              </div>
            )}
            {price_hike_pct > 0 && (
              <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-1 rounded-md text-[11px] font-bold border border-rose-500/20">
                <ArrowUpRight className="w-3 h-3" />
                {merchant}: ₹{(latest_amount - subscription.price_hike_amount).toLocaleString('en-IN')} → ₹{latest_amount?.toLocaleString('en-IN')} (+{price_hike_pct}%)
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Engine UI */}
        <div className="bg-background rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
              getActionColor(recommendation)
            )}>
              {getActionIcon(recommendation)}
              {recommendation}
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
              {confidence_score < 60 && <ShieldAlert className="w-3 h-3 text-amber-500" />}
              AI Confidence: {confidence_score}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recommendation_reason}
          </p>
        </div>

        <div className="pt-3 border-t border-border flex flex-col gap-2">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">Action Plan</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => !is_inactive && onToggleInactive(merchant)}
              className={cn("flex-1 py-1.5 text-xs font-semibold rounded transition-colors border",
                is_inactive ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
              )}
            >
              Cancel
            </button>
            <button
              onClick={() => !is_inactive && onToggleInactive(merchant)}
              className={cn("flex-1 py-1.5 text-xs font-semibold rounded transition-colors border",
                is_inactive ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
              )}
            >
              Downgrade
            </button>
            <button
              onClick={() => is_inactive && onToggleInactive(merchant)}
              className={cn("flex-1 py-1.5 text-xs font-semibold rounded transition-colors border",
                !is_inactive ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
              )}
            >
              Keep
            </button>
          </div>
          <div className="text-center">
            <button className="text-[10px] font-semibold text-muted-foreground hover:text-indigo-400 underline underline-offset-2 transition-colors">
              Renegotiate Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
