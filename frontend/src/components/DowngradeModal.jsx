import React, { useState, useEffect } from 'react';
import { X, Loader2, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDowngradeOptions, applyDowngrade } from '../api';
import { cn } from '../lib/utils';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <TrendingDown className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-white">AI Smart Tier Optimization</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={applying || success}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-gray-400 font-medium tracking-wide animate-pulse">
                AI is finding cheaper plans for {subscription.merchant}...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-emerald-500">
              <div className="bg-emerald-500/20 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Plan successfully downgraded!</h3>
              <p className="text-sm text-gray-400">Updating your dashboard...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  You are currently paying <strong className="text-white">₹{subscription.latest_amount}</strong> for {subscription.merchant}. Here are cheaper alternatives found by AI:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-lg">{opt.plan_name}</h4>
                          <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            Save ₹{opt.savings}/mo
                          </span>
                        </div>
                        <p className="text-2xl font-black text-white mb-4">₹{opt.new_price}</p>
                        <p className="text-xs text-gray-400 mb-6 font-medium">
                          {opt.features}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleApply(opt.plan_name, opt.new_price)}
                        disabled={applying}
                        className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
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
