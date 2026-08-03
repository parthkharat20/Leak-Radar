import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { draftCancellationEmail, sendCancellationEmail } from '../api';

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
                  <Bot className="w-5 h-5 text-[#024ad8]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a]">AI Cancellation Dispatcher</h2>
                  <p className="text-xs text-[#636363]">Draft and send formal cancellation notices</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                disabled={sending || success}
                className="p-1.5 text-[#636363] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#024ad8]/20 border-t-[#024ad8] rounded-full animate-spin" />
                  <p className="text-[#636363] text-xs font-semibold uppercase tracking-wider">
                    AI Agent is drafting formal cancellation notice...
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
                  <h3 className="text-xl font-bold text-[#1a1a1a]">Cancellation Notice Dispatched!</h3>
                  <p className="text-xs text-[#636363]">Updating portfolio state...</p>
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
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-[0.7px] text-[#636363] font-bold">Recipient Vendor Email</label>
                      <input 
                        type="email"
                        value={draft.vendor_email}
                        onChange={(e) => setDraft({...draft, vendor_email: e.target.value})}
                        className="w-full bg-white border border-[#e8e8e8] focus:border-[#024ad8] rounded-[4px] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-[0.7px] text-[#636363] font-bold">Subject Line</label>
                      <input 
                        type="text"
                        value={draft.subject}
                        onChange={(e) => setDraft({...draft, subject: e.target.value})}
                        className="w-full bg-white border border-[#e8e8e8] focus:border-[#024ad8] rounded-[4px] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-[0.7px] text-[#636363] font-bold">Message Content</label>
                      <textarea 
                        value={draft.body}
                        onChange={(e) => setDraft({...draft, body: e.target.value})}
                        rows={8}
                        className="w-full bg-white border border-[#e8e8e8] focus:border-[#024ad8] rounded-[4px] p-3.5 text-xs text-[#1a1a1a] outline-none font-mono resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && !success && (
              <div className="px-6 py-4 border-t border-[#e8e8e8] flex justify-end gap-3 bg-white">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  disabled={sending}
                  className="hp-btn-outline-ink text-xs py-2.5 px-5"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSend}
                  disabled={sending || !draft.vendor_email}
                  className="hp-btn-primary text-xs py-2.5 px-6"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Dispatch Email Notice
                    </>
                  )}
                </motion.button>
              </div>
            )}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


