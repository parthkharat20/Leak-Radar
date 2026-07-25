import { useState, useEffect } from 'react';
import { analyzeText, getSubscriptions, updateSubscription } from './api';
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
        await getSubscriptions();
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
      const result = await getSubscriptions();
      if (result.subscriptions && result.subscriptions.length > 0) {
        setAnalysisResult(result);
        setUploadModalOpen(false);
      } else {
        setError('No demo data found. Upload a statement to seed your dashboard.');
        setUploadModalOpen(true);
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-sky-400/20 font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={currentView === 'dashboard' ? handleReset : undefined}
            className={cn(
              'flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg px-1 py-0.5',
              currentView === 'dashboard' && 'hover:opacity-80 transition-opacity cursor-pointer'
            )}
            aria-label={currentView === 'dashboard' ? 'Back to overview' : 'LeakRadar home'}
          >
            <div className="p-1.5 rounded-md bg-zinc-900/40 border border-zinc-800/80">
              <Radar className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">LeakRadar</span>
            {currentView === 'dashboard' && (
              <span className="text-xs text-zinc-500 font-normal hidden sm:inline">· Back to Overview</span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/80 px-3 py-1.5 rounded-full">
            <UserCircle2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-medium text-zinc-100 tracking-wide">
              Parth Kharat <span className="text-zinc-500">(Demo)</span>
            </span>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-rise">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-zinc-100">Something went wrong</h4>
              <p className="text-sm text-rose-400/90">{error}</p>
            </div>
          </div>
        )}

        {initializing ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-zinc-500">Initializing LeakRadar...</p>
            </div>
          </div>
        ) : (
          <div className="view-transition">
            {currentView === 'landing' ? (
              <LandingPage
                onGetStarted={() => setUploadModalOpen(true)}
                onLoadDemo={handleLoadDemo}
                isLoading={loading}
              />
            ) : (
              <Dashboard
                analysisResult={analysisResult}
                onUpdateSubscription={handleUpdateSubscription}
                onUpdateData={handleUpdateData}
                onReset={handleReset}
              />
            )}
          </div>
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
