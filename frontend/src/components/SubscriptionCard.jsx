import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  getBrandIcon,
  getServiceInitials,
  getPrimaryActionKey,
} from '../lib/brandIcon';
import { ArrowUpRight, Calendar, ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react';
import CancellationModal from './CancellationModal';
import DowngradeModal from './DowngradeModal';
import NegotiateModal from './NegotiateModal';
import { BorderBeam } from './magicui/BorderBeam';

function truncateWords(text, count = 8) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return text;
  return `${words.slice(0, count).join(' ')}…`;
}

function ConfidenceMeter({ score }) {
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="flex-1 h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-[#024ad8] rounded-full"
        />
      </div>
      <span className="text-[10px] font-semibold text-[#636363] tabular-nums shrink-0">
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
    leak_score = 0,
    recommendation,
    recommendation_reason,
    confidence_score = 0,
    renewal_date,
    is_inactive = false,
  } = subscription;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const brand = getBrandIcon(merchant);
  const BrandIcon = brand?.Icon;
  const initials = getServiceInitials(merchant);
  const primaryAction = getPrimaryActionKey(recommendation);

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
  const isHighRisk = leak_score > 30 && !is_inactive;

  const handleAction = (open) => {
    if (!is_inactive) open();
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "hp-card hp-card-hover relative flex flex-col lg:flex-row gap-6 justify-between p-6 transition-all duration-200 overflow-hidden",
        is_inactive && "opacity-75 bg-[#f7f7f7]/60"
      )}
    >
      {/* Top Accent Stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#024ad8] rounded-t-[16px]" />

      {/* Magic UI BorderBeam for High Risk cards */}
      {isHighRisk && (
        <BorderBeam size={180} duration={10} colorFrom="#ff5050" colorTo="#024ad8" borderWidth={1.5} />
      )}

      {/* Left Column (Brand & Score) */}
      <div className="flex items-start justify-between lg:flex-col lg:w-[250px] lg:shrink-0 lg:border-r lg:border-[#e8e8e8] lg:pr-6">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border border-[#e8e8e8] bg-[#f7f7f7] shadow-xs">
            {BrandIcon ? (
              <BrandIcon className="h-6 w-6" style={{ color: brand.color }} />
            ) : (
              <span className="text-sm font-bold text-[#1a1a1a]">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="mb-1 flex flex-wrap items-center gap-2 text-lg font-bold text-[#1a1a1a] tracking-tight">
              <span className="truncate">{merchant}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="bg-[#f7f7f7] border border-[#e8e8e8] text-[#1a1a1a] px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase tracking-wider">
                {billing_frequency}
              </span>
              <span className="text-xs font-medium text-[#636363] uppercase tracking-wider">
                {category}
              </span>
            </div>

            {subscription.appears_unused && (
              <span className="mt-2 inline-flex items-center gap-1 bg-[#ff5050] text-white text-[10px] font-bold px-2 py-0.5 rounded-[3px] uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" />
                Appears Unused
              </span>
            )}
          </div>
        </div>

        {/* HP Leak Score Circular Meter */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-[#f7f7f7] p-0.5 lg:mt-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle className="text-[#e8e8e8] stroke-current" strokeWidth="4" fill="transparent" r={radius} cx="30" cy="30" />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-[#024ad8] stroke-current"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="30"
              cy="30"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-[#1a1a1a] font-mono">{leak_score || 0}</span>
            <span className="text-[8px] font-bold text-[#636363] uppercase tracking-tighter">LEAK</span>
          </div>
        </div>
      </div>

      {/* Right Column (Details & Actions) */}
      <div className="flex flex-1 flex-col justify-between space-y-4 lg:pl-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#636363]">Latest Amount</p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a] font-mono">
              ₹{latest_amount?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            {renewal_date && (
              <div className="flex items-center justify-end gap-1.5 text-xs text-[#636363] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#024ad8]" />
                Renews {renewal_date}
              </div>
            )}
            {price_hike_pct > 0 && (
              <div className="mt-1 flex items-center gap-1 bg-[#f9d4d2] text-[#b3262b] px-2.5 py-1 rounded-[4px] text-xs font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>
                  +₹{(subscription.price_hike_amount).toLocaleString('en-IN')} ({price_hike_pct}% hike)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 items-end">
          <div className="space-y-2.5 rounded-[12px] border border-[#e8e8e8] bg-[#f7f7f7]/80 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#e8e8e8] text-[#024ad8] font-bold px-3 py-1 rounded-[4px] text-xs uppercase tracking-wider shadow-xs">
                {recommendation}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {confidence_score < 60 && <ShieldAlert className="w-4 h-4 text-[#ff5050]" />}
                <ConfidenceMeter score={confidence_score} />
              </div>
            </div>

            {recommendation_reason && (
              <div className="text-xs text-[#636363]">
                <div 
                  onClick={() => setShowDetails(!showDetails)}
                  className="cursor-pointer leading-relaxed font-medium flex items-center justify-between"
                >
                  <span>{truncateWords(recommendation_reason)}</span>
                  <span className="text-[#024ad8] font-semibold underline flex items-center gap-0.5 shrink-0 ml-1">
                    Details
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showDetails && "rotate-180")} />
                  </span>
                </div>
                <AnimatePresence>
                  {showDetails && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 leading-relaxed text-[#1a1a1a] bg-white p-2.5 rounded-[4px] border border-[#e8e8e8] overflow-hidden"
                    >
                      {recommendation_reason}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end border-t border-[#e8e8e8] pt-4 lg:border-t-0 lg:pt-0">
            {primary && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(primary.open)}
                disabled={is_inactive}
                className="hp-btn-primary text-xs py-2.5 px-5"
              >
                {primary.label}
              </motion.button>
            )}

            <div className="flex items-center gap-2">
              {secondaries.map((action) => (
                <motion.button
                  key={action.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAction(action.open)}
                  disabled={is_inactive}
                  className="hp-btn-outline-ink text-xs py-2.5 px-4"
                >
                  {action.label}
                </motion.button>
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
    </motion.div>
  );
}


