import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDowngradeOptions, applyDowngrade } from '../api';

export default function DowngradeModal({ subscription, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (isOpen && subscription) {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const fetchOptions = async () => {
        try {
          const result = await getDowngradeOptions(subscription.id);
          setOptions(result);
        } catch (err) {
          setError(err?.response?.data?.detail || "Failed to find downgrade options. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchOptions();
    }
  }, [isOpen, subscription]);

  const handleApply = async (planName, newPrice) => {
    setApplying(true);
    setError(null);
    try {
      const updatedData = await applyDowngrade(subscription.id, {
        plan_name: planName,
        new_price: newPrice
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess(updatedData);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to apply downgrade.");
      setApplying(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-[#e8e8e8] rounded-[16px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_8px_24px_rgba(26,26,26,0.15)]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e8e8e8] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-[#c9e0fc]/60 p-2 rounded-full border border-[#024ad8]/20">
                  <TrendingDown className="w-5 h-5 text-[#024ad8]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a]">AI Smart Tier Optimization</h2>
                  <p className="text-xs text-[#636363]">Find and switch to lower-cost plan tiers</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={applying || success}
                className="p-1.5 text-[#636363] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#024ad8]/20 border-t-[#024ad8] rounded-full animate-spin" />
                  <p className="text-[#636363] text-xs font-semibold uppercase tracking-wider">
                    Searching lower-cost plans for {subscription.merchant}...
                  </p>
                </div>
              ) : success ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 space-y-3"
                >
                  <div className="bg-[#c9e0fc] p-3 rounded-full text-[#024ad8]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a]">Plan Downgrade Applied!</h3>
                  <p className="text-xs text-[#636363]">Updating portfolio metrics...</p>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <div className="bg-[#f9d4d2] border border-[#b3262b]/20 text-[#b3262b] px-4 py-3 rounded-[4px] flex items-start gap-3 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-xs text-[#636363] font-medium">
                      Current rate: <span className="font-bold text-[#1a1a1a]">₹{subscription.latest_amount}</span> for {subscription.merchant}. HP AI found the following lower-cost tiers:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {options.map((opt, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.2 }}
                          className="hp-card p-5 flex flex-col justify-between border-[#e8e8e8]"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <h4 className="font-bold text-[#1a1a1a] text-base">{opt.plan_name}</h4>
                              <span className="bg-[#c9e0fc] text-[#024ad8] px-2 py-0.5 rounded-[4px] text-[11px] font-bold font-mono shrink-0">
                                Save ₹{opt.savings}/mo
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-[#1a1a1a] mb-3 font-mono">₹{opt.new_price}</p>
                            <p className="text-xs text-[#636363] leading-relaxed mb-5">
                              {opt.features}
                            </p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleApply(opt.plan_name, opt.new_price)}
                            disabled={applying}
                            className="hp-btn-primary w-full text-xs py-2.5"
                          >
                            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Downgrade Tier'}
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


