import { useState } from 'react';
import { analyzeText, rescoreSubscriptions } from './api';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { AlertCircle } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inactiveMerchants, setInactiveMerchants] = useState([]);

  const handleAnalyze = async (rawText, sourceType) => {
    setLoading(true);
    setError(null);
    setInactiveMerchants([]);
    
    try {
      const result = await analyzeText(rawText, sourceType);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err.message || 'An error occurred while analyzing the data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInactive = async (merchant) => {
    if (!analysisResult) return;
    
    const newInactive = inactiveMerchants.includes(merchant)
      ? inactiveMerchants.filter(m => m !== merchant)
      : [...inactiveMerchants, merchant];
    
    setInactiveMerchants(newInactive);
    
    try {
      // Optimistic update could go here, but let's wait for API for true scores
      const result = await rescoreSubscriptions(analysisResult.subscriptions, newInactive);
      setAnalysisResult(prev => ({
        ...prev,
        subscriptions: result.subscriptions,
        // The backend doesn't recalculate total_monthly_leak in /api/rescore (Wait, does it? Let's assume it only returns subscriptions based on the prompt/code).
        // Let's recalculate it locally or assume backend does.
        total_monthly_leak: result.subscriptions
          .filter(s => s.leak_score > 50)
          .reduce((sum, s) => sum + s.latest_amount, 0)
      }));
    } catch (err) {
      console.error("Failed to rescore", err);
      // Revert the toggle on error
      setInactiveMerchants(inactiveMerchants);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setInactiveMerchants([]);
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

      {!analysisResult ? (
        <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
      ) : (
        <Dashboard 
          analysisResult={analysisResult} 
          inactiveMerchants={inactiveMerchants}
          onToggleInactive={handleToggleInactive}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
