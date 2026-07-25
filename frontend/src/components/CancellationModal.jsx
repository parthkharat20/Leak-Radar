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
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send email. Check SMTP credentials.");
      setSending(false);
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
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-base font-medium text-zinc-100">AI Cancellation Drafter</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={sending || success}
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
                AI Agent is drafting...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-100">Email successfully delivered!</h3>
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
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wide text-zinc-500 font-medium ml-1">To (Vendor Email)</label>
                  <input 
                    type="email"
                    value={draft.vendor_email}
                    onChange={(e) => setDraft({...draft, vendor_email: e.target.value})}
                    className="w-full bg-[#09090b] border border-zinc-800/70 focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wide text-zinc-500 font-medium ml-1">Subject</label>
                  <input 
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft({...draft, subject: e.target.value})}
                    className="w-full bg-[#09090b] border border-zinc-800/70 focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wide text-zinc-500 font-medium ml-1">Message Body</label>
                  <textarea 
                    value={draft.body}
                    onChange={(e) => setDraft({...draft, body: e.target.value})}
                    rows={8}
                    className="w-full bg-[#09090b] border border-zinc-800/70 focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !success && (
          <div className="px-6 py-4 border-t border-zinc-800/70 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !draft.vendor_email}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                sending || !draft.vendor_email
                  ? "bg-zinc-900/40 text-zinc-500 cursor-not-allowed border border-zinc-800/70"
                  : "bg-sky-400/10 text-sky-400 border border-sky-400/20 hover:bg-sky-400/20"
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
