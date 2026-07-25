import { X } from 'lucide-react';
import InputForm from './InputForm';

export default function UploadModal({ isOpen, onClose, onAnalyze, onUpload, isLoading }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-sm animate-fade-rise"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900/60 border border-zinc-800/80 rounded-xl backdrop-blur-md shadow-[0_0_60px_-12px_rgba(56,189,248,0.15)]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md">
          <div>
            <h2 id="upload-modal-title" className="text-base font-medium text-zinc-100">
              Upload Statement
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Drop a file or paste raw text — we&apos;ll scan for recurring charges
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <InputForm
            embedded
            onAnalyze={onAnalyze}
            onUpload={onUpload}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
