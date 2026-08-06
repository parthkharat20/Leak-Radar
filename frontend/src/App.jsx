import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeText, getSubscriptions, updateSubscription, loadDemoData } from './api';
import LandingPage from './components/LandingPage';
import UploadModal from './components/UploadModal';
import Dashboard from './components/Dashboard';
import { AlertCircle, UserCircle2, Radar } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const currentView = analysisResult ? 'dashboard' : 'landing';

  useEffect(() => {
    const init = async () => {
      try {
        const result = await getSubscriptions();
        if (result && result.subscriptions && result.subscriptions.length > 0) {
          setAnalysisResult(result);
        }
      } catch (err) {
        console.error('Failed to reach API on init', err);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  const handleAnalyze = async (rawText, sourceType) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeText(rawText, sourceType);
      setAnalysisResult(result);
      setUploadModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err.message || 'An error occurred while analyzing the data.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const { uploadFile } = await import('./api');
      const result = await uploadFile(file);
      setAnalysisResult(result);
      setUploadModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err.message || 'An error occurred while uploading the file.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadDemoData();
      if (result && result.subscriptions && result.subscriptions.length > 0) {
        setAnalysisResult(result);
        setUploadModalOpen(false);
      } else {
        setError('Failed to seed demo data. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err.message || 'Failed to load demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (subId, action) => {
    if (!analysisResult) return;

    try {
      const result = await updateSubscription(subId, action);
      setAnalysisResult(prev => ({
        ...prev,
        subscriptions: result.subscriptions,
        stats: result.stats
      }));
    } catch (err) {
      console.error('Failed to update subscription', err);
    }
  };

  const handleUpdateData = (newData) => {
    setAnalysisResult(newData);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-[#024ad8]/10 selection:text-[#024ad8] font-sans">
      {/* Top Utility Strip */}
      <div className="bg-[#1a1a1a] text-white text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-4 text-zinc-300">
          <span className="font-semibold text-white tracking-wider text-[11px] uppercase">Enterprise & Consumer Solutions</span>
          <span className="hidden md:inline text-zinc-500">|</span>
          <span className="hidden md:inline text-zinc-400">LeakRadar Subscription Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-200 bg-zinc-800/80 px-2.5 py-0.5 rounded-[4px] border border-zinc-700/50 text-[11px]">
            <UserCircle2 className="w-3.5 h-3.5 text-[#296ef9]" />
            <span className="font-medium">
              Parth Kharat <span className="text-zinc-400">(Demo Account)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Nav Bar */}
      <header className="sticky top-0 z-40 border-b border-[#e8e8e8] bg-white/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={currentView === 'dashboard' ? handleReset : undefined}
            className={cn(
              'flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#024ad8] rounded-md px-2 py-1 transition-all',
              currentView === 'dashboard' && 'hover:opacity-85 cursor-pointer'
            )}
            aria-label={currentView === 'dashboard' ? 'Back to overview' : 'LeakRadar Home'}
          >
            {/* Logo Badge */}
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-[#024ad8] text-white font-bold shadow-sm relative overflow-hidden"
            >
              <Radar className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[#1a1a1a] tracking-tight">LeakRadar</span>
                <span className="text-[10px] bg-[#024ad8] text-white font-bold px-1.5 py-0.2 rounded-[2px] uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-[#636363] font-normal hidden sm:inline">
                Automated Financial Audit & Savings Engine
              </span>
            </div>

            {currentView === 'dashboard' && (
              <span className="text-xs bg-[#f7f7f7] border border-[#e8e8e8] text-[#024ad8] font-semibold px-2.5 py-1 rounded-full ml-2 hidden md:inline-flex items-center gap-1">
                ← Back to Overview
              </span>
            )}
          </motion.button>

          <div className="flex items-center gap-3">
            {currentView === 'dashboard' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="hp-btn-outline hp-btn-sm text-xs"
              >
                Scan Another Statement
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setUploadModalOpen(true)}
              className="hp-btn-primary hp-btn-sm text-xs"
            >
              Analyze Statement
            </motion.button>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto mb-8 bg-[#b3262b]/10 border border-[#b3262b]/30 text-[#b3262b] px-5 py-4 rounded-[8px] flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#b3262b]" />
              <div>
                <h4 className="font-semibold text-[#1a1a1a]">Action Failed</h4>
                <p className="text-sm text-[#b3262b] mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {initializing ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#024ad8]/20 border-t-[#024ad8] rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-[#636363]">Connecting to LeakRadar Service...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentView === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <LandingPage
                  onGetStarted={() => setUploadModalOpen(true)}
                  onLoadDemo={handleLoadDemo}
                  isLoading={loading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Dashboard
                  analysisResult={analysisResult}
                  onUpdateSubscription={handleUpdateSubscription}
                  onUpdateData={handleUpdateData}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <UploadModal
        isOpen={uploadModalOpen && currentView === 'landing'}
        onClose={() => setUploadModalOpen(false)}
        onAnalyze={handleAnalyze}
        onUpload={handleUpload}
        isLoading={loading}
      />
    </div>
  );
}

export default App;

