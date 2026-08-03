import {
  Database,
  Shield,
  Activity,
  Mail,
  TrendingDown,
  MessageSquare,
  RefreshCw,
  ScanLine,
  ArrowRight,
  Sparkles,
  UserCircle2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';

const FEATURES = [
  {
    icon: Database,
    title: 'Persistent SQLite Vault',
    description: 'Zero data loss — every subscription survives restarts and reloads cleanly.',
    accent: 'bg-[#c9e0fc] text-[#024ad8]',
  },
  {
    icon: Shield,
    title: 'PII Local Redaction Shield',
    description: 'Sensitive account data is scrubbed locally before touching AI models.',
    accent: 'bg-[#e8e8e8] text-[#1a1a1a]',
  },
  {
    icon: Activity,
    title: 'AI Cashflow Shock Radar',
    description: '30-day forecasting timeline flags overdraft clusters before they hit.',
    accent: 'bg-[#c9e0fc] text-[#024ad8]',
  },
  {
    icon: Mail,
    title: 'Autonomous SMTP Cancellation Agent',
    description: 'Real cancellation emails drafted and dispatched on your behalf.',
    accent: 'bg-[#f9d4d2] text-[#b3262b]',
  },
  {
    icon: TrendingDown,
    title: 'Smart Tier Optimization',
    description: 'AI finds cheaper plans and applies downgrades instantly.',
    accent: 'bg-[#f7f7f7] text-[#1a1a1a]',
  },
  {
    icon: MessageSquare,
    title: 'AI Retention Negotiator',
    description: 'Practice against a tough retention persona to win real discounts.',
    accent: 'bg-[#c9e0fc] text-[#024ad8]',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time State Sync',
    description: 'Cancel, downgrade, or negotiate — gauges update without page refresh.',
    accent: 'bg-[#e8e8e8] text-[#1a1a1a]',
  },
  {
    icon: ScanLine,
    title: 'Instant OCR Ingestion',
    description: 'Drop PDFs, CSVs, or images — automated statement parsing in seconds.',
    accent: 'bg-[#c9e0fc] text-[#024ad8]',
  },
];

export default function LandingPage({ onGetStarted, onLoadDemo, isLoading }) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-16">
      {/* HP Hero Promo Card with Chevron Decoration */}
      <section className="relative animate-fade-rise mt-4">
        {/* HP Blue Chevron Brand Slash Decorations */}
        <div className="hidden lg:block absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-48 bg-[#024ad8] -skew-x-12 rounded-[1px] shadow-sm" />
        <div className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-48 bg-[#024ad8] -skew-x-12 rounded-[1px] shadow-sm" />

        <div className="hp-card p-8 md:p-14 border-[#e8e8e8] relative overflow-hidden bg-gradient-to-br from-white via-white to-[#f7f7f7]">
          {/* Subtle background graphic */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9e0fc]/20 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#024ad8]/20 bg-[#c9e0fc]/40 px-4 py-1 mb-6 text-xs font-semibold text-[#024ad8]">
              <Sparkles className="w-3.5 h-3.5 text-[#024ad8]" />
              <span>Enterprise AI · Groq Llama 3.3 Financial Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1a1a1a] leading-[1.08] mb-6">
              Stop Bleeding Money on{' '}
              <span className="text-[#024ad8] font-semibold underline decoration-[#024ad8]/30 decoration-wavy underline-offset-8">
                Unused Subscriptions
              </span>
            </h1>

            <p className="text-[#636363] text-base md:text-lg leading-relaxed max-w-2xl mb-8 font-normal">
              LeakRadar parses your bank statements, scores recurring merchant charges, and delivers an immediate action plan — cancel, downgrade, or negotiate — backed by automated email dispatch and AI negotiation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={onGetStarted}
                disabled={isLoading}
                className="hp-btn-primary w-full sm:w-auto min-w-[220px]"
              >
                <span>Upload Bank Statement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLoadDemo}
                disabled={isLoading}
                className="hp-btn-outline-ink w-full sm:w-auto min-w-[220px]"
              >
                <UserCircle2 className="w-4 h-4 text-[#024ad8]" />
                <span>Load Demo (Parth Kharat)</span>
              </button>
            </div>

            {/* Micro Badges */}
            <div className="mt-8 pt-6 border-t border-[#e8e8e8] w-full flex flex-wrap items-center justify-center gap-6 text-xs text-[#636363]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#024ad8]" /> 100% Local PII Scrubbing
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#024ad8]" /> Automated SMTP Dispatch
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#024ad8]" /> SQLite Persistent Audit Vault
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section className="animate-fade-rise-delay-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#e8e8e8]">
          <div>
            <span className="text-xs uppercase tracking-[0.7px] text-[#024ad8] font-bold block mb-1">
              Capabilities Catalog
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-[#1a1a1a] tracking-tight">
              Enterprise Subscription Intelligence
            </h2>
          </div>
          <p className="text-xs text-[#636363] max-w-sm mt-2 md:mt-0">
            Powered by enterprise component standards and deterministic leak scoring models.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="hp-card hp-card-hover p-6 flex flex-col justify-between"
            >
              <div>
                <div className={cn(
                  'w-10 h-10 rounded-[8px] flex items-center justify-center mb-4 font-semibold shadow-xs',
                  feature.accent
                )}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-xs text-[#636363] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HP Dark Slab Section (Closing Prelude) */}
      <section className="animate-fade-rise-delay-2">
        <div className="bg-[#1a1a1a] text-white rounded-[16px] p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#024ad8]/20 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-xs uppercase tracking-[0.7px] text-[#296ef9] font-bold block">
                Instant Audit Ready
              </span>
              <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                Ready to reclaim your recurring monthly budget?
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                Analyze your PDF bank statements or raw transaction data in less than 5 seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={onGetStarted}
                disabled={isLoading}
                className="hp-btn-primary min-w-[200px]"
              >
                <span>Upload Statement</span>
              </button>
              <button
                onClick={onLoadDemo}
                disabled={isLoading}
                className="bg-[#292929] hover:bg-[#3d3d3d] text-white text-[13px] font-semibold tracking-[0.7px] uppercase px-6 py-3 rounded-[4px] transition-colors duration-150 flex items-center justify-center gap-2 border border-zinc-700"
              >
                <span>Explore Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

