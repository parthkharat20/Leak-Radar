import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Radar, Play, Loader2, FileText, FileSpreadsheet, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const TICKER_ITEMS = [
  'Netflix ₹649',
  'Spotify ₹119',
  'Adobe CC ₹4,200',
  'Amazon Prime ₹1,499',
  'Disney+ ₹299',
  'YouTube Premium ₹129',
  'Apple One ₹195',
  'Google One ₹650',
];

const FORMAT_CHIPS = [
  { label: 'PDF', icon: FileText },
  { label: 'CSV', icon: FileSpreadsheet },
  { label: 'JPG', icon: Image },
  { label: 'PNG', icon: Image },
];

export default function InputForm({ onAnalyze, onUpload, isLoading, embedded = false }) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [rawText, setRawText] = useState('');
  const [sourceType, setSourceType] = useState('bank_statement');
  const [errorMessage, setErrorMessage] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setErrorMessage(null);
      try {
        await onUpload(acceptedFiles[0]);
      } catch (err) {
        console.error("File processing error:", err);
        const detail = err?.response?.data?.detail || err.message || "Error processing file. Please ensure it is a valid CSV/PDF or try pasting text manually.";
        setErrorMessage(detail);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isLoading,
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onAnalyze(rawText, sourceType);
  };

  const tickerTrack = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className={cn("relative w-full", embedded ? "max-w-none mx-0" : "max-w-4xl mx-auto")}>
      {!embedded && !showManualInput && (
        <div
          className="absolute inset-x-0 top-[38%] -translate-y-1/2 overflow-hidden pointer-events-none select-none opacity-[0.05]"
          aria-hidden="true"
        >
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap text-sm font-mono tabular-nums text-zinc-100">
            {tickerTrack.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center shrink-0 rounded-full border border-zinc-700/50 bg-zinc-800/40 px-3 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={cn("relative", embedded ? "space-y-5" : "space-y-8")}>
        {!embedded && (
          <div className="text-center space-y-4 mb-10">
            <div className="flex items-center justify-center gap-3 animate-fade-rise">
              <div className="relative flex items-center justify-center w-14 h-14">
                <span
                  className="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping motion-reduce:animate-none"
                  style={{ animationDelay: '0s' }}
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping motion-reduce:animate-none"
                  style={{ animationDelay: '1.3s' }}
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping motion-reduce:animate-none"
                  style={{ animationDelay: '2.6s' }}
                  aria-hidden="true"
                />
                <div className="relative p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/70">
                  <Radar className="w-7 h-7 text-sky-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
                LeakRadar
              </h1>
            </div>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed animate-fade-rise-delay-1">
              Drop your bank statement, SMS alerts, or receipts — we&apos;ll surface every recurring charge and show you what to cut.
            </p>
          </div>
        )}

        {!showManualInput ? (
          <div className={cn("space-y-5", !embedded && "animate-fade-rise-delay-2")}>
            <div className="relative rounded-lg">
              {!isLoading && (
                <div
                  className={cn(
                    "absolute -inset-px rounded-lg pointer-events-none motion-reduce:animate-none",
                    isDragActive ? "animate-border-shimmer-active" : "animate-border-shimmer"
                  )}
                  aria-hidden="true"
                />
              )}

              <div
                {...getRootProps()}
                className={cn(
                  "relative border border-dashed rounded-lg p-10 sm:p-12 text-center transition-colors duration-150 cursor-pointer flex flex-col items-center justify-center gap-5 min-h-[280px] bg-zinc-900/40",
                  isDragActive
                    ? "border-sky-400 bg-sky-400/5"
                    : "border-zinc-800/70 hover:border-zinc-700/80",
                  isLoading && "pointer-events-none opacity-80"
                )}
              >
                <input {...getInputProps()} />

                {isLoading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-zinc-100">Scanning your document...</p>
                      <p className="text-zinc-500 text-sm">This may take a moment depending on file size.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-lg bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-center">
                        <Radar className="w-8 h-8 text-sky-400" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-base font-medium text-zinc-100">
                        {isDragActive ? "Release to scan" : "Drop your statement here"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {FORMAT_CHIPS.map(({ label, icon: Icon }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 bg-zinc-800/60 border border-zinc-700/50 rounded-md px-2 py-0.5 text-xs text-zinc-400 hover:scale-105 transition-transform duration-150"
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </span>
                        ))}
                      </div>
                      <p className="text-zinc-500 text-xs">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="text-center">
                <p className="text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-4 rounded-lg inline-block">
                  {errorMessage}
                </p>
              </div>
            )}

            {!isLoading && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-sm font-medium text-zinc-500 hover:text-sky-400 underline underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] rounded"
                >
                  Prefer pasting raw text? Click here
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="bg-zinc-900/40 border border-zinc-800/70 p-6 rounded-lg space-y-6">
            <div className="space-y-2">
              <label htmlFor="sourceType" className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
                Data Source Type
              </label>
              <select
                id="sourceType"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800/70 rounded-lg p-3 text-zinc-100 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors"
              >
                <option value="bank_statement">Bank Statement (CSV/Text)</option>
                <option value="sms">SMS Alerts</option>
                <option value="email">Email Receipts</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="rawText" className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
                Raw Text
              </label>
              <textarea
                id="rawText"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your unstructured data here..."
                className="w-full h-64 bg-[#09090b] border border-zinc-800/70 rounded-lg p-4 text-zinc-300 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors resize-y"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="px-6 py-3 rounded-full font-medium text-sm bg-zinc-900/40 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700/80 transition-colors duration-150 border border-zinc-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                Back to Upload
              </button>
              <button
                type="submit"
                disabled={isLoading || !rawText.trim()}
                className={cn(
                  "flex-1 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]",
                  isLoading || !rawText.trim()
                    ? "bg-zinc-900/40 text-zinc-500 cursor-not-allowed border border-zinc-800/70"
                    : "bg-sky-400/10 text-sky-400 border border-sky-400/20 hover:bg-sky-400/20"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Analyze Text
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
