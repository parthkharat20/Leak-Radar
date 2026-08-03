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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/70 backdrop-blur-sm animate-fade-rise">
      <div className="bg-white border border-[#e8e8e8] rounded-[16px] w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] shadow-[0_8px_24px_rgba(26,26,26,0.15)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e8e8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#c9e0fc]/60 p-2 rounded-full border border-[#024ad8]/20">
              <MessageSquare className="w-5 h-5 text-[#024ad8]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1a1a]">AI Retention Negotiator</h2>
              <p className="text-xs text-[#636363]">Practice or copy script for {subscription.merchant}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#636363] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HP Tab Switcher */}
        <div className="flex border-b border-[#e8e8e8] bg-[#f7f7f7]">
          <button
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'cheatsheet' ? 'text-[#024ad8] border-b-2 border-[#024ad8] bg-white' : 'text-[#636363] hover:text-[#1a1a1a]'}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            <FileText className="w-4 h-4" /> Strategy Playbook
          </button>
          <button
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'practice' ? 'text-[#024ad8] border-b-2 border-[#024ad8] bg-white' : 'text-[#636363] hover:text-[#1a1a1a]'}`}
            onClick={() => setActiveTab('practice')}
          >
            <MessageSquare className="w-4 h-4" /> AI Roleplay Simulator
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="w-8 h-8 border-3 border-[#024ad8]/20 border-t-[#024ad8] rounded-full animate-spin" />
              <p className="text-[#636363] text-xs font-semibold uppercase tracking-wider">Generating custom negotiation playbook...</p>
            </div>
          ) : (
            <>
              {/* Cheatsheet Tab */}
              {activeTab === 'cheatsheet' && playbook && (
                <div className="p-6 overflow-y-auto h-full space-y-6">
                  <div className="bg-[#f7f7f7] border border-[#e8e8e8] rounded-[12px] p-5">
                    <h3 className="text-[#1a1a1a] font-bold text-base mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#024ad8]" />
                      Custom Retention Strategy & Script
                    </h3>
                    <ul className="space-y-3.5">
                      {playbook.script.map((bullet, idx) => (
                        <li key={idx} className="flex gap-3 text-[#1a1a1a] text-xs leading-relaxed font-medium">
                          <span className="bg-[#024ad8] text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={copyToClipboard}
                    className="hp-btn-outline-ink w-full text-xs py-3"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-[#024ad8]" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied Strategy to Clipboard' : 'Copy Full Playbook Script'}
                  </button>
                </div>
              )}

              {/* Practice Chat Tab */}
              {activeTab === 'practice' && (
                <div className="flex flex-col h-full">
                  
                  {discountSuccess && (
                    <div className="bg-[#c9e0fc] border-b border-[#024ad8]/20 px-6 py-2.5 flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#024ad8] shrink-0" />
                      <p className="text-[#024ad8] text-xs font-bold">
                        Discount Offered! Estimated annual savings: ₹{Math.round(subscription.latest_amount * 0.3 * 12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-[12px] px-4 py-3 text-xs leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-[#024ad8] text-white font-medium shadow-xs' 
                            : 'bg-[#f7f7f7] border border-[#e8e8e8] text-[#1a1a1a] font-medium'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-[#f7f7f7] border border-[#e8e8e8] rounded-[12px] px-4 py-3 flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-[#024ad8] rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-[#024ad8] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-[#024ad8] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e8e8e8] flex gap-2 bg-white">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your retention counter-offer..."
                      disabled={sending || loading}
                      className="flex-1 bg-[#f7f7f7] border border-[#e8e8e8] rounded-[4px] px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#024ad8] font-medium"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputValue.trim() || loading}
                      className="hp-btn-primary text-xs px-4 py-2.5"
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

