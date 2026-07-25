import { useState, useEffect } from 'react';
import { analyzeText, getSubscriptions, updateSubscription } from './api';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { AlertCircle, UserCircle2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const result = await getSubscriptions();
        if (result.subscriptions && result.subscriptions.length > 0) {
          setAnalysisResult(result);
        }
      } catch (err) {
        console.error("Failed to load initial state", err);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  const handleAnalyze = async (rawText, sourceType) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeText(rawText, sourceType);
      setAnalysisResult(result);
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
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err.message || 'An error occurred while uploading the file.');
      throw err;
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
      console.error("Failed to update subscription", err);
    }
  };

  const handleUpdateData = (newData) => {
    setAnalysisResult(newData);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-sky-400/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-zinc-100">Analysis Failed</h4>
            <p className="text-sm text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Demo Badge */}
      <div className="absolute top-4 right-4 sm:right-6 flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/70 px-3 py-1.5 rounded-full z-50">
        <UserCircle2 className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-medium text-zinc-100 tracking-wide">Parth Kharat <span className="text-zinc-500">(Demo)</span></span>
      </div>

      {!analysisResult ? (
        <InputForm onAnalyze={handleAnalyze} onUpload={handleUpload} isLoading={loading} />
      ) : (
        <Dashboard 
          analysisResult={analysisResult} 
          onUpdateSubscription={handleUpdateSubscription}
          onUpdateData={handleUpdateData}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
