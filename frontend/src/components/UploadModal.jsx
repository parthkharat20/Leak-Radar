import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import InputForm from './InputForm';

export default function UploadModal({ isOpen, onClose, onAnalyze, onUpload, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#e8e8e8] rounded-[16px] shadow-[0_8px_24px_rgba(26,26,26,0.15)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#e8e8e8] bg-white">
              <div>
                <h2 id="upload-modal-title" className="text-lg font-bold text-[#1a1a1a]">
                  Upload Bank Statement
                </h2>
                <p className="text-xs text-[#636363] mt-0.5">
                  Drop a statement file or paste raw transaction log — automated PII redaction active
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 text-[#636363] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Close modal"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


