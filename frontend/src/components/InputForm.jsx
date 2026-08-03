import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Play, Loader2, FileText, FileSpreadsheet, Image, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const FORMAT_CHIPS = [
  { label: 'PDF Document', icon: FileText },
  { label: 'CSV Spreadsheet', icon: FileSpreadsheet },
  { label: 'JPG Image', icon: Image },
  { label: 'PNG Image', icon: Image },
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

  return (
    <div className={cn("w-full", embedded ? "max-w-none" : "max-w-3xl mx-auto")}>
      <div className="space-y-6">
        {!embedded && (
          <div className="text-center space-y-3 mb-8">
            <span className="text-xs uppercase tracking-[0.7px] text-[#024ad8] font-bold">
              Document & Statement Ingestion
            </span>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#1a1a1a]">
              Upload Financial Data
            </h1>
            <p className="text-[#636363] text-sm max-w-lg mx-auto leading-relaxed">
              Upload bank statements, SMS export logs, or payment receipts. Local PII scrubbing runs automatically before AI scoring.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showManualInput ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "hp-card p-10 sm:p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-5 min-h-[260px]",
                  isDragActive
                    ? "border-[#024ad8] bg-[#c9e0fc]/20"
                    : "hover:border-[#024ad8]/50 hover:bg-[#f7f7f7]/60",
                  isLoading && "pointer-events-none opacity-70"
                )}
              >
                <input {...getInputProps()} />

                {isLoading ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-[#024ad8]/20 border-t-[#024ad8] rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-[#1a1a1a]">Scanning & Extracting Subscriptions...</p>
                    <p className="text-xs text-[#636363]">Processing via HP Local Redaction Engine</p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="w-14 h-14 rounded-full bg-[#c9e0fc]/50 border border-[#024ad8]/20 flex items-center justify-center text-[#024ad8]"
                    >
                      <Upload className="w-7 h-7" />
                    </motion.div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-[#1a1a1a]">
                        {isDragActive ? "Drop statement to scan" : "Drag and drop your bank statement here"}
                      </p>
                      <p className="text-xs text-[#636363]">Supported Formats:</p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        {FORMAT_CHIPS.map(({ label, icon: Icon }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 bg-[#f7f7f7] border border-[#e8e8e8] rounded-[4px] px-2.5 py-1 text-xs font-medium text-[#1a1a1a]"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#024ad8]" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {errorMessage && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#b3262b] bg-[#f9d4d2] border border-[#b3262b]/20 py-2.5 px-4 rounded-[4px] inline-block">
                    {errorMessage}
                  </p>
                </div>
              )}

              {!isLoading && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className="text-xs font-semibold text-[#024ad8] hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    Prefer pasting raw text? Click here
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleManualSubmit}
              className="hp-card p-6 space-y-5"
            >
              <div className="space-y-1.5">
                <label htmlFor="sourceType" className="text-xs uppercase tracking-[0.7px] text-[#636363] font-bold">
                  Source Document Type
                </label>
                <select
                  id="sourceType"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full bg-white border border-[#e8e8e8] rounded-[4px] p-3 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#024ad8] font-medium"
                >
                  <option value="bank_statement">Bank Statement (CSV / Raw Export)</option>
                  <option value="sms">SMS Financial Alerts</option>
                  <option value="email">Email Payment Receipts</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rawText" className="text-xs uppercase tracking-[0.7px] text-[#636363] font-bold">
                  Statement Text / Transaction Log
                </label>
                <textarea
                  id="rawText"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste transaction data here..."
                  className="w-full h-56 bg-white border border-[#e8e8e8] rounded-[4px] p-3.5 text-[#1a1a1a] font-mono text-xs focus:outline-none focus:border-[#024ad8] resize-y"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="hp-btn-outline-ink text-xs py-3 px-6"
                >
                  Back to File Upload
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading || !rawText.trim()}
                  className="hp-btn-primary flex-1 text-xs py-3 px-6"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Leak Analysis
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
