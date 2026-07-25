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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-destructive/15 border border-destructive/30 text-destructive px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Analysis Failed</h4>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Demo Badge */}
      <div className="absolute top-4 right-6 flex items-center gap-2 bg-secondary border border-border px-3 py-1.5 rounded-full shadow-sm z-50">
        <UserCircle2 className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground tracking-wide">Parth Kharat <span className="opacity-60">(Demo)</span></span>
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
