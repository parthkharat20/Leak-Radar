import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { CloudUpload, Play, Loader2, FileText, FileImage } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function InputForm({ onAnalyze, onUpload, isLoading }) {
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
        setErrorMessage("Error processing file. Please ensure it is a valid CSV/PDF or try pasting text manually.");
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <CloudUpload className="w-12 h-12 text-blue-500" />
          LeakRadar
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Upload your bank statement, SMS alerts, or emails to detect hidden subscriptions and price hikes instantly.
        </p>
      </div>

      {!showManualInput ? (
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[300px]",
              isDragActive ? "border-blue-500 bg-blue-900/20" : "border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-600",
              isLoading && "pointer-events-none opacity-80"
            )}
          >
            <input {...getInputProps()} />
            
            {isLoading ? (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <div className="space-y-2">
                  <p className="text-xl font-bold text-white">Extracting transactions via OCR...</p>
                  <p className="text-gray-400 text-sm">This may take a moment depending on file size.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4">
                  <FileText className="w-12 h-12 text-gray-500" />
                  <FileImage className="w-12 h-12 text-gray-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-300">
                    {isDragActive ? "Drop the file here..." : "Drag & drop your bank statement here"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Supports .PDF, .CSV, .JPG, and .PNG formats, or click to browse.
                  </p>
                </div>
              </>
            )}
          </div>
          
          {errorMessage && (
            <div className="text-center mt-4">
              <p className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 py-2 px-4 rounded-lg inline-block">
                {errorMessage}
              </p>
            </div>
          )}
          
          {!isLoading && (
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setShowManualInput(true)}
                className="text-sm font-semibold text-gray-400 hover:text-blue-400 underline underline-offset-4 transition-colors"
              >
                Prefer pasting raw text? Click here
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="bg-gray-900/50 border border-gray-700 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-2">
            <label htmlFor="sourceType" className="text-sm font-medium text-gray-300">
              Data Source Type
            </label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="bank_statement">Bank Statement (CSV/Text)</option>
              <option value="sms">SMS Alerts</option>
              <option value="email">Email Receipts</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="rawText" className="text-sm font-medium text-gray-300">
              Raw Text
            </label>
            <textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your unstructured data here..."
              className="w-full h-64 bg-gray-950 border border-gray-700 rounded-lg p-4 text-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="px-6 py-4 rounded-lg font-bold text-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all border border-gray-600"
            >
              Back to Upload
            </button>
            <button
              type="submit"
              disabled={isLoading || !rawText.trim()}
              className={cn(
                "flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all",
                isLoading || !rawText.trim()
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Analyze Text
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
