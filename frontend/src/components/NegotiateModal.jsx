import React, { useState, useEffect, useRef } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Retention Negotiator</h2>
              <p className="text-xs text-gray-400">Practicing for {subscription.merchant}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/30">
          <button
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'cheatsheet' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            <FileText className="w-4 h-4" /> Negotiation Cheatsheet
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'practice' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('practice')}
          >
            <MessageSquare className="w-4 h-4" /> Practice with AI Rep
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-gray-400 font-medium">Generating negotiation playbook...</p>
            </div>
          ) : (
            <>
              {/* Cheatsheet Tab */}
              {activeTab === 'cheatsheet' && playbook && (
                <div className="p-6 overflow-y-auto h-full space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Your Custom Strategy
                    </h3>
                    <ul className="space-y-4">
                      {playbook.script.map((bullet, idx) => (
                        <li key={idx} className="flex gap-3 text-gray-300">
                          <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-700"
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
                    <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-6 py-3 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <p className="text-emerald-400 text-sm font-bold">
                        Negotiation Successful! Estimated annual savings: ₹{Math.round(subscription.latest_amount * 0.3 * 12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/10">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.sender === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message to the agent..."
                      disabled={sending || loading}
                      className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputValue.trim() || loading}
                      className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center"
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
    </div>
  );
}
