import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  itemName = ""
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2 hover:bg-gray-100 rounded-lg transition-all z-10 group"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  </button>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6 pr-8">
                      <div className="p-2.5 sm:p-3 rounded-full bg-red-50 text-red-600 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="flex-1 pt-0.5 sm:pt-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
                          {title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                      <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 text-sm sm:text-base active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-red-500/30 active:scale-95"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;