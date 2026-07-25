import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { draftCancellationEmail, sendCancellationEmail } from '../api';
import { cn } from '../lib/utils';

export default function CancellationModal({ subscription, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [draft, setDraft] = useState({
    vendor_email: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (isOpen && subscription) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const fetchDraft = async () => {
        try {
          const result = await draftCancellationEmail(subscription.id);
          setDraft({
            vendor_email: result.vendor_email || '',
            subject: result.subject || '',
            body: result.body || ''
          });
        } catch (err) {
          setError(err?.response?.data?.detail || "Failed to generate draft. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchDraft();
    }
  }, [isOpen, subscription]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const updatedData = await sendCancellationEmail(subscription.id, draft);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(updatedData);
        onClose();
      }, 2000); // Wait 2s to show success toast
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send email. Check SMTP credentials.");
      setSending(false);
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
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-white">AI Cancellation Drafter</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={sending || success}
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
                AI Agent is drafting...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-emerald-500">
              <div className="bg-emerald-500/20 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Email successfully delivered!</h3>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">To (Vendor Email)</label>
                  <input 
                    type="email"
                    value={draft.vendor_email}
                    onChange={(e) => setDraft({...draft, vendor_email: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Subject</label>
                  <input 
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft({...draft, subject: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Message Body</label>
                  <textarea 
                    value={draft.body}
                    onChange={(e) => setDraft({...draft, body: e.target.value})}
                    rows={8}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 text-sm text-gray-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !success && (
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !draft.vendor_email}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg",
                sending || !draft.vendor_email
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Auto-Send via LeakRadar
                </>
              )}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
