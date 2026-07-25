import { cn } from '../lib/utils';
import { AlertCircle, ArrowUpRight, CheckCircle2, Info, Power, Tag } from 'lucide-react';

export default function SubscriptionCard({ subscription, onToggleInactive }) {
  const {
    merchant,
    category,
    is_recurring,
    latest_amount,
    price_hike_pct,
    leak_score,
    recommended_action,
    is_inactive = false, // We'll manage this state from the parent based on user toggles
  } = subscription;

  const getActionColor = (action) => {
    switch (action) {
      case 'Cancel':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Renegotiate':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Downgrade / consolidate':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Cancel':
        return <AlertCircle className="w-4 h-4" />;
      case 'Renegotiate':
        return <Info className="w-4 h-4" />;
      case 'Downgrade / consolidate':
        return <Tag className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getLeakScoreColor = (score) => {
    if (score > 70) return 'text-rose-500 stroke-rose-500';
    if (score > 40) return 'text-amber-500 stroke-amber-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  // Simple SVG Gauge/Ring for the leak score
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (leak_score / 100) * circumference;

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 shadow-sm transition-all hover:shadow-lg relative overflow-hidden",
      is_inactive && "opacity-75 grayscale-[0.5]"
    )}>
      {/* Leak Score Ring Background */}
      <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <circle className={getLeakScoreColor(leak_score)} strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
        </svg>
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
            {merchant}
            {!is_recurring && (
              <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                One-off
              </span>
            )}
          </h3>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {category}
          </span>
        </div>
        
        {/* Leak Score Gauge */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle
              className="text-muted stroke-current"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="30"
              cy="30"
            />
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
            <span className="text-sm font-bold text-foreground">{leak_score}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Latest Amount</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{latest_amount.toLocaleString('en-IN')}
            </p>
          </div>

          {price_hike_pct > 0 && (
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-md text-xs font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {price_hike_pct}% Hike
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border",
            getActionColor(recommended_action)
          )}>
            {getActionIcon(recommended_action)}
            {recommended_action}
          </div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Still using this?
            </span>
            <button
              onClick={() => onToggleInactive(merchant)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative flex items-center",
                !is_inactive ? "bg-emerald-500" : "bg-muted"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full bg-white transition-transform transform mx-1",
                !is_inactive ? "translate-x-4" : "translate-x-0"
              )} />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
