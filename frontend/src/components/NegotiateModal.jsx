import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, FileText, Send, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { getNegotiationPlaybook, sendNegotiationMessage } from '../api';

export default function NegotiateModal({ subscription, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cheatsheet');
  const [loading, setLoading] = useState(true);
  const [playbook, setPlaybook] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [discountSuccess, setDiscountSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && subscription) {
      setLoading(true);
      setDiscountSuccess(false);
      setActiveTab('cheatsheet');
      setChatHistory([]);
      
      const initPlaybook = async () => {
        try {
          const pb = await getNegotiationPlaybook(subscription.id);
          setPlaybook(pb);
          if (pb && pb.initial_bot_message) {
            setChatHistory([
              { sender: 'assistant', text: pb.initial_bot_message }
            ]);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      
      initPlaybook();
    }
  }, [isOpen, subscription]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, sending]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMessage = { sender: 'user', text: inputValue };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInputValue('');
    setSending(true);

    try {
      const response = await sendNegotiationMessage(subscription.id, newHistory);
      setChatHistory([
        ...newHistory,
        { sender: 'assistant', text: response.reply }
      ]);
      if (response.discount_offered) {
        setDiscountSuccess(true);
      }
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...newHistory,
        { sender: 'assistant', text: "Sorry, I'm experiencing technical difficulties." }
      ]);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    if (playbook?.script) {
      navigator.clipboard.writeText(playbook.script.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90">
      <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-lg w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-400/10 p-2 rounded-full border border-sky-400/20">
              <MessageSquare className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-medium text-zinc-100">AI Retention Negotiator</h2>
              <p className="text-xs text-zinc-500">Practicing for {subscription.merchant}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800/70">
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${activeTab === 'cheatsheet' ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-400/5' : 'text-zinc-500 hover:text-zinc-100'}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            <FileText className="w-4 h-4" /> Negotiation Cheatsheet
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${activeTab === 'practice' ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-400/5' : 'text-zinc-500 hover:text-zinc-100'}`}
            onClick={() => setActiveTab('practice')}
          >
            <MessageSquare className="w-4 h-4" /> Practice with AI Rep
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">Generating negotiation playbook...</p>
            </div>
          ) : (
            <>
              {/* Cheatsheet Tab */}
              {activeTab === 'cheatsheet' && playbook && (
                <div className="p-6 overflow-y-auto h-full space-y-6">
                  <div className="bg-sky-400/5 border border-sky-400/20 rounded-lg p-5">
                    <h3 className="text-zinc-100 font-medium text-base mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-sky-400" />
                      Your Custom Strategy
                    </h3>
                    <ul className="space-y-4">
                      {playbook.script.map((bullet, idx) => (
                        <li key={idx} className="flex gap-3 text-zinc-400 text-sm">
                          <span className="bg-sky-400/10 text-sky-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-xs font-mono tabular-nums">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-3 bg-zinc-900/40 hover:bg-zinc-800/50 text-zinc-100 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 border border-zinc-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Cheatsheet'}
                  </button>
                </div>
              )}

              {/* Practice Chat Tab */}
              {activeTab === 'practice' && (
                <div className="flex flex-col h-full">
                  
                  {discountSuccess && (
                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <p className="text-emerald-400 text-sm font-medium font-mono tabular-nums">
                        Negotiation Successful! Estimated annual savings: ₹{Math.round(subscription.latest_amount * 0.3 * 12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.sender === 'user' 
                            ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20 rounded-tr-sm' 
                            : 'bg-zinc-900/60 text-zinc-100 rounded-tl-sm border border-zinc-800/70'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                          <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                          <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                          <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/70 flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message to the agent..."
                      disabled={sending || loading}
                      className="flex-1 bg-[#09090b] border border-zinc-800/70 rounded-full px-4 py-2.5 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputValue.trim() || loading}
                      className="bg-sky-400/10 text-sky-400 border border-sky-400/20 px-4 py-2.5 rounded-full disabled:opacity-50 hover:bg-sky-400/20 transition-colors duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
