import React, { useState, useEffect } from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90">
      <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-400/10 p-2 rounded-full border border-sky-400/20">
              <TrendingDown className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-base font-medium text-zinc-100">AI Smart Tier Optimization</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={applying || success}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">
                AI is finding cheaper plans for {subscription.merchant}...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-100">Plan successfully downgraded!</h3>
              <p className="text-sm text-zinc-500">Updating your dashboard...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  You are currently paying <strong className="text-zinc-100 font-mono tabular-nums">₹{subscription.latest_amount}</strong> for {subscription.merchant}. Here are cheaper alternatives found by AI:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => (
                    <div key={idx} className="bg-zinc-900/40 border border-zinc-800/70 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors duration-150">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-medium text-zinc-100 text-base">{opt.plan_name}</h4>
                          <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20 font-mono tabular-nums shrink-0">
                            Save ₹{opt.savings}/mo
                          </span>
                        </div>
                        <p className="text-2xl font-semibold text-zinc-100 mb-4 font-mono tabular-nums">₹{opt.new_price}</p>
                        <p className="text-xs text-zinc-500 mb-6">
                          {opt.features}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleApply(opt.plan_name, opt.new_price)}
                        disabled={applying}
                        className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full text-sm font-medium transition-colors duration-150 disabled:opacity-50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Downgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
