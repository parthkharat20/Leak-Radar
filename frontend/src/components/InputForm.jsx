import { useState } from 'react';
import { cn } from '../lib/utils';
import { UploadCloud, Play } from 'lucide-react';

export default function InputForm({ onAnalyze, isLoading }) {
  const [rawText, setRawText] = useState('');
  const [sourceType, setSourceType] = useState('bank_statement');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onAnalyze(rawText, sourceType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <UploadCloud className="w-12 h-12 text-primary" />
          LeakRadar
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Paste your bank statement, SMS alerts, or emails to detect hidden subscriptions and price hikes instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-secondary/30 border border-border p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="sourceType" className="text-sm font-medium text-foreground">
            Data Source Type
          </label>
          <select
            id="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="bank_statement">Bank Statement (CSV/Text)</option>
            <option value="sms">SMS Alerts</option>
            <option value="email">Email Receipts</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="rawText" className="text-sm font-medium text-foreground">
            Raw Text
          </label>
          <textarea
            id="rawText"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your unstructured data here..."
            className="w-full h-64 bg-background border border-border rounded-lg p-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !rawText.trim()}
          className={cn(
            "w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all",
            isLoading || !rawText.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Analyze Data
            </>
          )}
        </button>
      </form>
    </div>
  );
}
