import {
  Radar,
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
} from 'lucide-react';
import { cn } from '../lib/utils';

const FEATURES = [
  {
    icon: Database,
    title: 'Persistent SQLite Vault',
    description: 'Zero data loss — every subscription survives restarts and reloads.',
    accent: 'text-sky-400',
  },
  {
    icon: Shield,
    title: 'PII Local Redaction Shield',
    description: 'Sensitive data scrubbed locally before anything reaches the AI.',
    accent: 'text-emerald-400',
  },
  {
    icon: Activity,
    title: 'AI Cashflow Shock Radar',
    description: '30-day Recharts timeline flags overdraft clusters before they hit.',
    accent: 'text-sky-400',
  },
  {
    icon: Mail,
    title: 'Autonomous SMTP Cancellation Agent',
    description: 'Real cancellation emails drafted and dispatched on your behalf.',
    accent: 'text-rose-400',
  },
  {
    icon: TrendingDown,
    title: 'Smart Tier Optimization',
    description: 'AI finds cheaper plans and applies downgrades instantly.',
    accent: 'text-amber-400',
  },
  {
    icon: MessageSquare,
    title: 'AI Retention Negotiator',
    description: 'Practice against a tough retention rep persona — win real discounts.',
    accent: 'text-indigo-400',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time State Sync',
    description: 'Cancel, downgrade, or negotiate — gauges update with zero page refresh.',
    accent: 'text-emerald-400',
  },
  {
    icon: ScanLine,
    title: 'Instant OCR Ingestion',
    description: 'Drop PDFs, CSVs, or images — automated statement parsing in seconds.',
    accent: 'text-sky-400',
  },
];

export default function LandingPage({ onGetStarted, onLoadDemo, isLoading }) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero */}
      <section className="text-center pt-8 pb-16 md:pt-16 md:pb-24 animate-fade-rise">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-4 py-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-zinc-400 tracking-wide">
            Powered by Groq Llama 3.3 &amp; SQLite
          </span>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="relative flex items-center justify-center w-16 h-16">
            <span
              className="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping motion-reduce:animate-none"
              style={{ animationDelay: '0s' }}
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping motion-reduce:animate-none"
              style={{ animationDelay: '1.3s' }}
              aria-hidden="true"
            />
            <div className="relative p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <Radar className="w-8 h-8 text-sky-400" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-zinc-100 max-w-3xl mx-auto leading-[1.1] mb-5">
          Stop Bleeding Money on{' '}
          <span className="bg-gradient-to-br from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Dead Subscriptions
          </span>
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-rise-delay-1">
          LeakRadar scans your statements, scores every recurring charge, and gives you a clear action plan — cancel, downgrade, or negotiate — before silent leaks drain your account.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-rise-delay-2">
          <button
            onClick={onGetStarted}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-sky-400/90 text-[#09090b] hover:bg-sky-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-50"
          >
            Launch Demo / Upload Statement
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLoadDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-zinc-300 bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:text-zinc-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50"
          >
            <UserCircle2 className="w-4 h-4 text-sky-400" />
            Load Demo — Parth Kharat
          </button>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="pb-20 animate-fade-rise-delay-2">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium mb-2">Platform</p>
          <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Everything you need to plug the leaks
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-colors duration-150"
            >
              <div className={cn(
                'w-9 h-9 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4',
                feature.accent
              )}>
                <feature.icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-zinc-100 mb-1.5">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onGetStarted}
            disabled={isLoading}
            className="text-sm font-medium text-zinc-500 hover:text-sky-400 underline underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
          >
            Get Started Free — upload your first statement
          </button>
        </div>
      </section>
    </div>
  );
}
